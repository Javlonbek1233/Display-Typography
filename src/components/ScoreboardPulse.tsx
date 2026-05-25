import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldAlert, Cpu, Users, RotateCcw, Volume2, VolumeX, Eye } from "lucide-react";
import { SportMatch } from "../types";

interface ScoreboardPulseProps {
  onPredict: (matchId: string) => void;
}

export default function ScoreboardPulse({ onPredict }: ScoreboardPulseProps) {
  const [matches, setMatches] = useState<SportMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>("match-1");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        if (data.length > 0 && !selectedMatchId) {
          setSelectedMatchId(data[0].matchId);
        }
      })
      .catch((err) => console.error("Error loading live scores:", err));

    // Poll live ticking updates every 4 seconds
    const interval = setInterval(() => {
      fetch("/api/matches")
        .then((res) => res.json())
        .then((data) => setMatches(data))
        .catch((err) => console.error("Error polling live scores:", err));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/matches/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
        if (soundEnabled) {
          playCyberSound("reset");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setResetting(false), 800);
    }
  };

  const playCyberSound = (type: string) => {
    if (!soundEnabled) return;
    try {
      // Small synthesised futuristic bip to make interaction responsive
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "select") {
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "reset") {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Web Audio API not permitted by iframe yet:", e);
    }
  };

  const selectedMatch = matches.find((m) => m.matchId === selectedMatchId) || matches[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="scoreboard-root">
      {/* Match Column Selector */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF66]"></span>
            </span>
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#00FF66] font-black">Live Scoreboard</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reset Live State */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset Live Match Simulation"
              className="p-1.5 rounded-sm bg-[#111] hover:bg-neutral-800 border border-white/10 text-white/60 hover:text-[#00FF66] active:scale-95 transition-all outline-none cursor-pointer"
            >
              <RotateCcw className={`h-4.5 w-4.5 ${resetting ? "animate-spin" : ""}`} />
            </button>

            {/* Micro Cyber Audio toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Disable UI Sonics" : "Enable UI Sonics"}
              className={`p-1.5 rounded-sm border outline-none transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-[#00FF66] text-black border-transparent font-black"
                  : "bg-[#111] text-gray-500 border-white/10"
              }`}
            >
              {soundEnabled ? <Volume2 className="h-4.5 w-4.5 font-bold" /> : <VolumeX className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
          {matches.map((m) => {
            const isLive = m.status === "LIVE";
            const isSelected = m.matchId === selectedMatchId;
            return (
              <motion.div
                key={m.matchId}
                layoutId={`card-${m.matchId}`}
                onClick={() => {
                  setSelectedMatchId(m.matchId);
                  playCyberSound("select");
                }}
                className={`relative p-4 rounded-sm border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#111] border-[#00FF66] border-l-8"
                    : "bg-[#0b0b0b] border-white/10 hover:border-white/20 hover:bg-[#111]"
                }`}
              >
                {/* Visual Accent Strip when not active */}
                {!isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: m.teamHomeColor }}
                  />
                )}
                
                <div className="flex justify-between items-center mb-2 pl-2">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase font-black">
                    {m.sport}
                  </span>
                  
                  {isLive ? (
                    <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm animate-pulse">
                      <Zap className="h-3 w-3 fill-current" />
                      CYCLE {m.minute}
                    </span>
                  ) : m.status === "UPCOMING" ? (
                    <span className="bg-neutral-800 text-[#00FF66] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border border-[#00FF66]/20">
                      SCHEDULED
                    </span>
                  ) : (
                    <span className="bg-neutral-900 text-white/40 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      CONCLUDED
                    </span>
                  )}
                </div>

                {/* Score section matching requested Bold Typography card structure */}
                <div className="grid grid-cols-12 gap-1 items-center pl-2">
                  <div className="col-span-4 text-lg font-black italic uppercase tracking-tighter text-white truncate text-right">
                    {m.teamHome}
                  </div>
                  <div className="col-span-4 flex justify-center">
                    <span className={`font-mono text-lg font-black px-3 py-0.5 rounded-sm text-center ${isSelected ? 'text-[#00FF66] bg-black border border-[#00FF66]/30' : 'text-white bg-[#1a1a1a]'}`}>
                      {m.scoreHome} — {m.scoreAway}
                    </span>
                  </div>
                  <div className="col-span-4 text-lg font-black italic uppercase tracking-tighter text-white truncate text-left">
                    {m.teamAway}
                  </div>
                </div>

                {/* Arena location footer */}
                <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-white/40 pl-2 uppercase">
                  <span className="truncate max-w-[200px]">{m.arena}</span>
                  <span className="text-[9px] text-[#00FF66] font-black tracking-wider flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {(m.spectators).toFixed(1)}k Holos
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Interactive Telemetry / Highlight Screen */}
      <div className="lg:col-span-7">
        {selectedMatch ? (
          <div className="bg-[#050505] border-2 border-white/10 p-6 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Design High Tech Header */}
            <div>
              {/* Telemetry Header */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">Telemetry //</span>
                    <span className="text-[#00FF66] font-mono text-[10px] uppercase tracking-[0.2em] font-black">{selectedMatch.sport}</span>
                  </div>
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mt-1">
                    {selectedMatch.teamHome} <span className="text-white/40 font-mono text-xl font-normal not-italic">vs</span> {selectedMatch.teamAway}
                  </h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white/40 font-mono text-[10px] uppercase tracking-widest">STADIUM CORE FEED</span>
                  <span className="text-red-500 font-mono font-black text-xs uppercase tracking-wider mt-1">
                    {selectedMatch.arena.split(' ')[0]} ARENA
                  </span>
                </div>
              </div>

              {/* Digital Neon Score Display */}
              <div className="grid grid-cols-3 bg-[#111] border border-white/10 rounded-sm p-6 text-center shadow-lg relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00FF66]/50 to-transparent" />
                
                <div className="flex flex-col justify-center">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">POSSESSION</div>
                  <div className="text-3xl font-black italic tracking-tighter text-white">{selectedMatch.stats.laserPossession[0]}%</div>
                  <div className="text-[9px] text-[#00FF66] font-mono mt-2 uppercase font-bold">{selectedMatch.teamHome.split(' ')[0]}</div>
                </div>

                <div className="flex flex-col justify-center items-center border-l border-r border-white/10 px-2">
                  <div className="text-[10px] font-mono text-[#00FF66] tracking-[0.2em] uppercase font-black mb-1">
                    {selectedMatch.status === "LIVE" ? "ACTIVE PERIOD" : "CONCLUDED"}
                  </div>
                  <div className="text-4xl font-black italic tracking-tighter text-white">
                    {selectedMatch.status === "LIVE" ? `Q-${Math.ceil(selectedMatch.minute / 22.5)}` : "FINAL"}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">POSSESSION</div>
                  <div className="text-3xl font-black italic tracking-tighter text-white">{selectedMatch.stats.laserPossession[1]}%</div>
                  <div className="text-[9px] text-[#00FF66] font-mono mt-2 uppercase font-bold">{selectedMatch.teamAway.split(' ')[0]}</div>
                </div>
              </div>

              {/* Metric Percentage Bars */}
              <div className="space-y-4 mb-6">
                <h3 className="font-mono text-xs uppercase text-white/60 tracking-[0.2em] font-black">Holographic Telemetry Stats</h3>
                
                {/* Shield Remaining */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider font-bold">
                    <span className="text-white/60">Plasma Shield remaining</span>
                    <span className="text-[#00FF66]">{selectedMatch.stats.plasmaShieldRemaining[0]}% vs {selectedMatch.stats.plasmaShieldRemaining[1]}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#111] rounded-none flex overflow-hidden">
                    <div
                      className="bg-[#00FF66] transition-all duration-505"
                      style={{ width: `${(selectedMatch.stats.plasmaShieldRemaining[0] / (selectedMatch.stats.plasmaShieldRemaining[0] + selectedMatch.stats.plasmaShieldRemaining[1] + 1)) * 100}%` }}
                    />
                    <div
                      className="bg-white/20 transition-all duration-505 flex-1"
                    />
                  </div>
                </div>

                {/* Overheat levels */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider font-bold">
                    <span className="text-white/60">Thruster Core Overheat</span>
                    <span className="text-red-500">{selectedMatch.stats.overheatLevels[0]}% vs {selectedMatch.stats.overheatLevels[1]}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#111] rounded-none flex overflow-hidden">
                    <div
                      className="bg-red-500 transition-all duration-505"
                      style={{ width: `${selectedMatch.stats.overheatLevels[0]}%` }}
                    />
                    <div className="flex-1" />
                    <div
                      className="bg-white/20 transition-all duration-505"
                      style={{ width: `${selectedMatch.stats.overheatLevels[1]}%` }}
                    />
                  </div>
                </div>

                {/* Strikes */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-[#111] border border-white/10 rounded-none text-center">
                    <span className="text-[10px] font-mono text-white/40 block uppercase tracking-wider">Kinetic Striking Forces</span>
                    <span className="font-mono text-xl text-white font-black italic">{selectedMatch.stats.kineticStrikes[0]} GW</span>
                  </div>
                  <div className="p-3 bg-[#111] border border-white/10 rounded-none text-center">
                    <span className="text-[10px] font-mono text-white/40 block uppercase tracking-wider">Opponent Shield Pressure</span>
                    <span className="font-mono text-xl text-white font-black italic">{selectedMatch.stats.kineticStrikes[1]} GW</span>
                  </div>
                </div>
              </div>

              {/* Holographic Highlight Stream */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 ">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 font-black">Live holographic feed log</span>
                </div>
                <div className="bg-black border border-white/10 rounded-none p-4 max-h-[140px] overflow-y-auto custom-scrollbar font-mono text-xs tracking-wide text-white/90 space-y-2">
                  <AnimatePresence initial={false}>
                    {selectedMatch.highlightRelay.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="pb-1.5 border-b border-white/5 last:border-0"
                      >
                        <span className="text-[#00FF66] mr-2 font-black">&gt;&gt;</span>
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* AI Call to Action Trigger */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center flex-wrap gap-4">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
                NEED STRATEGIC GAMEPLAY CALCULATIONS?
              </span>
              <button
                onClick={() => onPredict(selectedMatch.matchId)}
                className="px-6 py-2.5 font-mono text-[11px] uppercase font-black tracking-widest text-black bg-[#00FF66] hover:bg-[#33ffaa] transition-all transform active:scale-95 outline-none cursor-pointer"
              >
                REQUEST AI STRATEGY
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-white/40 font-mono text-xs uppercase bg-[#111] border border-white/10 rounded-none tracking-widest">
            Acquiring telemetry links ...
          </div>
        )}
      </div>
    </div>
  );
}
