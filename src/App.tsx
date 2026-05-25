/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gamepad2, BrainCircuit, Trophy, UserCheck, Flame, Cpu, Star } from "lucide-react";
import ScoreboardPulse from "./components/ScoreboardPulse";
import FantasyArena from "./components/FantasyArena";
import AiPredictions from "./components/AiPredictions";
import StatsLeaderboard from "./components/StatsLeaderboard";

type MenuTab = "matches" | "fantasy" | "predictions" | "leaderboard";

export default function App() {
  const [activeTab, setActiveTab] = useState<MenuTab>("matches");
  const [selectedMatchIdForPrediction, setSelectedMatchIdForPrediction] = useState<string | null>(null);

  // Cross-route navigation to predictions
  const handleInitiatePrediction = (matchId: string) => {
    setSelectedMatchIdForPrediction(matchId);
    setActiveTab("predictions");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00FF66] selection:text-black flex flex-col justify-between" id="arenax-root">
      
      {/* Top Banner & Navigation Dashboard */}
      <div>
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Logo and futuristic Brand Name */}
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black italic tracking-tighter text-[#00FF66] uppercase">
                ArenaX
              </div>
              <span className="hidden md:inline-block text-[9px] font-mono tracking-[0.2em] uppercase text-white/40 border-l border-white/20 pl-4">
                HYPER-SPORT PLATFORM // 2095
              </span>
            </div>

            {/* Platform Controls Navigation tabs */}
            <nav className="flex bg-[#111] border border-white/10 p-1 font-mono text-[11px] w-full sm:w-auto overflow-x-auto custom-scrollbar">
              {/* Tab match center */}
              <button
                onClick={() => setActiveTab("matches")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap outline-none cursor-pointer ${
                  activeTab === "matches"
                    ? "bg-[#00FF66] text-black font-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Gamepad2 className="h-4 w-4" />
                Live Arena
              </button>

              {/* Tab fantasy */}
              <button
                onClick={() => setActiveTab("fantasy")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap outline-none cursor-pointer ${
                  activeTab === "fantasy"
                    ? "bg-[#00FF66] text-black font-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Fantasy
              </button>

              {/* Tab Predictions */}
              <button
                onClick={() => setActiveTab("predictions")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap outline-none cursor-pointer ${
                  activeTab === "predictions"
                    ? "bg-[#00FF66] text-black font-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <BrainCircuit className="h-4 w-4" />
                Predictions
              </button>

              {/* Tab Leaderboard */}
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap outline-none cursor-pointer ${
                  activeTab === "leaderboard"
                    ? "bg-[#00FF66] text-black font-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Trophy className="h-4 w-4" />
                Leaderboards
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-600 rounded text-[10px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap">
                Live Stream
              </div>
            </div>

          </div>
        </header>

        {/* Outer Background Visual elements */}
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "matches" && (
                <ScoreboardPulse onPredict={handleInitiatePrediction} />
              )}
              {activeTab === "fantasy" && (
                <FantasyArena />
              )}
              {activeTab === "predictions" && (
                <AiPredictions selectedMatchIdFromScoreboard={selectedMatchIdForPrediction} />
              )}
              {activeTab === "leaderboard" && (
                <StatsLeaderboard />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Ticker Info footer */}
      <footer className="h-8 bg-[#00FF66] text-black flex items-center overflow-hidden border-t border-white/10">
        <div className="flex-none bg-black text-white h-full flex items-center px-4 text-[10px] font-black italic uppercase tracking-wider">
          News Ticker
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex gap-12 text-[11px] font-black uppercase whitespace-nowrap tracking-wider animate-marquee">
            <span>// RAIDERS SIGN QUARTERBACK V. DRAKE TO A 4-YEAR CYBER-CONTRACT //</span>
            <span>// STADIUM CAPACITY FOR THE FINALS REACHES 100% //</span>
            <span>// AI PREDICTION RECORD AT 89.4% THIS SEASON //</span>
            <span>// NEW FANTASY LEAGUE "THE NEON GAUNTLET" NOW OPEN //</span>
          </div>
        </div>
        <div className="flex-none px-4 text-[10px] font-black font-mono text-black hidden md:block border-l border-black/10">
          2095 STADIUM NETWORK
        </div>
      </footer>
    </div>
  );
}
