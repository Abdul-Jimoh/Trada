import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 no-underline text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="text-black w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Trada</span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="capitalize">Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
