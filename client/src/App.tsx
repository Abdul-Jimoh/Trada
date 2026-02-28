import { BrowserRouter as Router } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
        <Navbar />
        <AppRouter />
      </div>
    </Router>
  );
}

export default App;
