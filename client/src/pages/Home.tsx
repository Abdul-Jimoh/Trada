import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { FeatureCard } from "../components/FeatureCard";

export function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-24">
      {/* Hero Section */}
      <section className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-tight">
            AI Trading <span className="text-primary italic">Co-Pilot</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-12 leading-relaxed opacity-80">
            Real-time Vision AI that watches your charts and identifies
            high-probability trading patterns instantly.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/dashboard"
              className="btn-primary px-8 py-3 text-lg no-underline inline-block"
            >
              Launch Dashboard
            </Link>
            <Link
              to="https://github.com/Abdul-Jimoh/Trada"
              target="_blank"
              className="px-8 py-3 rounded-xl bg-secondary border border-border font-semibold hover:bg-secondary/80 transition-all text-lg"
            >
              View Documentation
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<TrendingUp className="text-primary w-6 h-6" />}
          title="Pattern Recognition"
          description="Automatic detection of Bull Flags, Support/Resistance, and RSI divergences."
        />
        <FeatureCard
          icon={<Zap className="text-accent w-6 h-6" />}
          title="Real-time Analysis"
          description="Ultra-low latency processing using Stream Video and Vision Agents SDK."
        />
        <FeatureCard
          icon={<Activity className="text-primary w-6 h-6" />}
          title="Live Feedback"
          description="Receive instant audio and visual cues when a pattern confirms."
        />
      </div>
    </main>
  );
}
