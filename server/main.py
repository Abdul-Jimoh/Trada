import uvicorn
import os
import time
import asyncio
import jwt
from collections import defaultdict
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vision_agents.core import Agent, User
from vision_agents.plugins import getstream, gemini

load_dotenv()

app = FastAPI(title="Trada Vision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Message store and WebSocket connections per call
call_messages: dict[str, list[dict]] = defaultdict(list)
active_websockets: dict[str, list[WebSocket]] = defaultdict(list)


@app.get("/")
async def root():
    return {"message": "Trada Vision API is running", "status": "online"}


@app.get("/token")
async def get_token(user_id: str = "trading_pilot_user"):
    api_key = os.getenv("STREAM_API_KEY")
    api_secret = os.getenv("STREAM_SECRET")

    if not api_key or not api_secret:
        raise HTTPException(status_code=500, detail="Stream API Key or Secret not configured")

    current_time = int(time.time())
    payload = {
        "sub": f"user/{user_id}",
        "user_id": user_id,
        "iat": current_time,
        "exp": current_time + (60 * 60),
    }

    token = jwt.encode(payload, api_secret, algorithm="HS256")
    return {"token": token, "apiKey": api_key, "userId": user_id}


class StartAgentRequest(BaseModel):
    call_id: str


@app.post("/start-agent")
async def start_agent(req: StartAgentRequest):
    api_key = os.getenv("STREAM_API_KEY")
    api_secret = os.getenv("STREAM_SECRET")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if not api_key or not api_secret or not gemini_key:
        raise HTTPException(status_code=500, detail="Missing environment variables")

    asyncio.create_task(run_agent(req.call_id))
    return {"status": "agent_starting", "call_id": req.call_id}


class ChatRequest(BaseModel):
    call_id: str
    message: str


@app.post("/chat")
async def send_chat(req: ChatRequest):
    print(f"[Chat] call={req.call_id} message={req.message}")
    # Store user message so agent's next analysis cycle includes it
    call_messages[req.call_id].append({
        "text": f"User asked: {req.message}",
        "timestamp": str(int(time.time())),
        "from_user": True,
    })
    # Trigger an immediate agent response broadcast
    asyncio.create_task(answer_user_question(req.call_id, req.message))
    return {"status": "received"}


@app.websocket("/ws/{call_id}")
async def websocket_messages(websocket: WebSocket, call_id: str):
    await websocket.accept()
    active_websockets[call_id].append(websocket)
    try:
        # Send existing messages first
        for msg in call_messages[call_id]:
            await websocket.send_json(msg)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets[call_id]:
            active_websockets[call_id].remove(websocket)


async def broadcast_insight(call_id: str, text: str, from_user: bool = False):
    msg = {
        "text": text,
        "timestamp": str(int(time.time())),
        "from_user": from_user,
    }
    call_messages[call_id].append(msg)
    dead = []
    for ws in active_websockets.get(call_id, []):
        try:
            await ws.send_json(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in active_websockets[call_id]:
            active_websockets[call_id].remove(ws)


# Store agents per call so we can query them
active_agents: dict[str, Agent] = {}


async def answer_user_question(call_id: str, question: str):
    await broadcast_insight(call_id, "💬 Speak to the agent directly using your mic!")

async def run_agent(call_id: str):
    api_key = os.getenv("STREAM_API_KEY")
    api_secret = os.getenv("STREAM_SECRET")

    try:
        agent = Agent(
            edge=getstream.Edge(
                api_key=api_key,
                api_secret=api_secret,
            ),
            agent_user=User(
                name="Trada Vision AI",
                id="trada_vision_agent",
            ),
            instructions="""You are a Professional Crypto Technical Analyst AI watching a live trading chart on screen share.
Monitor candlestick patterns, volume, support/resistance levels, and trend signals.
Keep responses short — 1 to 2 sentences max.
Use emojis: 🕯️ for patterns, 📊 for volume, 📈📉 for trends.
Be concise and actionable.""",
            llm=gemini.Realtime(fps=1),
        )

        active_agents[call_id] = agent
        await agent.create_user()
        call = await agent.create_call("default", call_id)
        await broadcast_insight(call_id, "🤖 Trada Vision AI is joining the call...")
        await asyncio.sleep(3)

        async with agent.join(call):
            await broadcast_insight(call_id, "👁️ Agent active! Unmute your mic and ask 'What do you see?'")
            # Keep agent alive — it listens and responds via voice automatically
            while True:
                await asyncio.sleep(10)

    except Exception as e:
        print(f"Agent error: {e}")
        await broadcast_insight(call_id, f"⚠️ Agent error: {str(e)[:120]}")
    finally:
        active_agents.pop(call_id, None)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)