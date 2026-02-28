import { useState, useEffect, useRef, useCallback } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  Call,
  StreamCall,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
} from "lucide-react";
import {
  Activity,
  Layout,
  MessageSquare,
  ScreenShare,
  Play,
  Power,
} from "lucide-react";
import "@stream-io/video-react-sdk/dist/css/styles.css";

type InsightMessage = {
  id: string;
  text: string;
  timestamp: Date;
  fromUser?: boolean;
};

export function Dashboard() {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightMessage[]>([]);

  const handleInsight = useCallback((msg: InsightMessage) => {
    setInsights((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    let videoClient: StreamVideoClient | null = null;

    const initClient = async () => {
      try {
        const response = await fetch("http://localhost:8000/token");
        if (!response.ok)
          throw new Error("Failed to fetch secure token from backend");

        const { token, apiKey, userId } = await response.json();
        const user = { id: userId, name: "Trading Pilot" };

        // videoClient = new StreamVideoClient({ apiKey, user, token });
        videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user,
          token,
        });
        setClient(videoClient);
      } catch (err: unknown) {
        console.error("Dashboard initialization error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize dashboard",
        );
      }
    };

    initClient();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, []);

  const startSession = async () => {
    if (!client) return;

    const callId = `session_${Math.random().toString(36).substring(7)}`;
    const newCall = client.call("default", callId);
    await newCall.join({ create: true });
    setCall(newCall);
    setIsSessionActive(true);

    // Trigger the Vision AI agent to join
    try {
      await fetch("http://localhost:8000/start-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: callId }),
      });
    } catch (err) {
      console.error("Failed to start agent:", err);
    }
  };

  const endSession = async () => {
    if (call) {
      await call.leave();
      setCall(null);
    }
    setIsSessionActive(false);
  };

  if (error || !client) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">
            {error ? "Connection Error" : "Securely Connecting..."}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error ||
              "Fetching secure transmission credentials from Trada Backend."}
          </p>
          {error && (
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-2"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-background">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {!isSessionActive ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="text-primary w-10 h-10 fill-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Ready to pilot?</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Start a new session to share your screen and invoke the Trada
                  agent.
                </p>
                <button
                  onClick={startSession}
                  className="btn-primary px-8 py-3 text-lg flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5" /> Start Session
                </button>
              </div>
            </div>
          ) : (
            <StreamCall call={call!}>
              <DashboardView onEndSession={endSession} />
            </StreamCall>
          )}
        </div>

        {/* Sidebar - AI Chat */}
        <div className="w-80 border-l border-border bg-card/30 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              AI INSIGHTS
            </h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              Live
            </span>
          </div>
          <InsightsSidebar
            insights={insights}
            isSessionActive={isSessionActive}
            call={call}
            onInsight={handleInsight}
          />
        </div>
      </div>
    </StreamVideo>
  );
}

function DashboardView({ onEndSession }: { onEndSession: () => void }) {
  const { useScreenShareState } = useCallStateHooks();
  const { isMute: isScreenShareMuted } = useScreenShareState();
  const isSharingScreen = !isScreenShareMuted;
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-0 p-4 relative">
        <div className="w-full h-full bg-black/40 rounded-2xl border border-border flex items-center justify-center overflow-hidden shadow-2xl">
          <SpeakerLayout />
          {!isSharingScreen && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-0 p-4 text-center">
              <ScreenShare className="w-16 h-16 text-primary mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Screen Share Required</h3>
              <p className="text-muted-foreground max-w-sm">
                Enable screen sharing so the Vision AI can watch your trading
                chart and identify patterns.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-20 border-t border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between px-6 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg border border-border">
            <Layout className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Auto-pilot View</span>
          </div>
        </div>

        <CustomCallControls />

        <button
          onClick={onEndSession}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-medium border border-red-500/20"
        >
          <Power className="w-4 h-4" /> End Session
        </button>
      </div>
    </div>
  );
}

function CustomCallControls() {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { isMute: isCamMuted } = useCameraState();
  const { useScreenShareState } = useCallStateHooks();
  const { isMute: isScreenShareMuted } = useScreenShareState();
  const isSharingScreen = !isScreenShareMuted;

  const toggleMic = () => call?.microphone.toggle();
  const toggleCam = () => call?.camera.toggle();
  const toggleScreen = async () => {
    if (isSharingScreen) {
      await call?.screenShare.disable();
    } else {
      await call?.screenShare.enable();
    }
  };

  const btnBase =
    "w-11 h-11 rounded-full flex items-center justify-center transition-all border cursor-pointer";
  const btnNormal = `${btnBase} bg-white/10 border-white/20 text-white hover:bg-white/25`;
  const btnActive = `${btnBase} bg-primary/30 border-primary/50 text-primary`;
  const btnMuted = `${btnBase} bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30`;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
      <div className="relative group">
        <button
          onClick={toggleMic}
          className={isMicMuted ? btnMuted : btnNormal}
        >
          {isMicMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {isMicMuted ? "Unmute mic" : "Mute mic"}
        </span>
      </div>
      <div className="relative group">
        <button
          onClick={toggleCam}
          className={isCamMuted ? btnMuted : btnNormal}
        >
          {isCamMuted ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </button>
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {isCamMuted ? "Turn on camera" : "Turn off camera"}
        </span>
      </div>
      <div className="relative group">
        <button
          onClick={toggleScreen}
          className={isSharingScreen ? btnActive : btnNormal}
        >
          {isSharingScreen ? (
            <MonitorOff className="w-5 h-5" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </button>
        <span className="z-20 absolute -top-9 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {isSharingScreen ? "Stop sharing" : "Share screen"}
        </span>
      </div>
    </div>
  );
}

function InsightsSidebar({
  insights,
  isSessionActive,
  call,
  onInsight,
}: {
  insights: InsightMessage[];
  isSessionActive: boolean;
  call: Call | null;
  onInsight: (msg: InsightMessage) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");

  // Poll for messages from the agent via Stream call chat
  useEffect(() => {
    if (!call || !isSessionActive) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${call.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onInsight({
        id: Math.random().toString(36).substring(7),
        text: data.text,
        timestamp: new Date(parseInt(data.timestamp) * 1000),
        fromUser: data.from_user ?? false,
      });
    };

    ws.onerror = (err) => console.error("Insight WS error:", err);

    return () => ws.close();
  }, [call, isSessionActive, onInsight]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [insights]);

  const sendMessage = async () => {
    if (!userInput.trim() || !call) return;
    const text = userInput;
    setUserInput("");
    try {
      await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: call.id, message: text }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (!isSessionActive) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="opacity-40">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-sm">
            Start a session to activate the Vision AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {insights.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center opacity-40">
            <div>
              <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-xs text-muted-foreground">
                Agent is watching your screen...
              </p>
            </div>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg p-3 ${
                insight.fromUser
                  ? "bg-secondary border border-border ml-4"
                  : "bg-primary/5 border border-primary/20"
              }`}
            >
              <p className="text-sm leading-relaxed">{insight.text}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {insight.fromUser ? "You · " : "AI · "}
                {insight.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask the AI analyst..."
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
          />
          <button
            onClick={sendMessage}
            className="bg-primary/20 border border-primary/30 text-primary rounded-lg px-3 py-2 hover:bg-primary/30 transition-all text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
