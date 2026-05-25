import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Cpu, Sparkles, TrendingUp, RefreshCw, BarChart2, ShieldCheck, Milestone } from "lucide-react";
import { SportMatch, AiPrediction } from "../types";

interface AiPredictionsProps {
  selectedMatchIdFromScoreboard: string | null;
}

export default function AiPredictions({ selectedMatchIdFromScoreboard }: AiPredictionsProps) {
  const [matches, setMatches] = useState<SportMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<AiPrediction | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<AiPrediction[]>([]);

  // Load matches
  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        // Default to prop, then fallback to first item
        if (selectedMatchIdFromScoreboard) {
          setSelectedMatchId(selectedMatchIdFromScoreboard);
          triggerPrediction(selectedMatchIdFromScoreboard, data);
        } else if (data.length > 0) {
          setSelectedMatchId(data[0].matchId);
        }
      })
      .catch((err) => console.error("Error loading matches for preview", err));
  }, [selectedMatchIdFromScoreboard]);

  const handlePredictClick = () => {
    if (selectedMatchId) {
      triggerPrediction(selectedMatchId, matches);
    }
  };

  const triggerPrediction = async (id: string, matchPool: SportMatch[]) => {
    // Check if we have this prediction cached in history
    const cached = predictionHistory.find((p) => p.matchId === id);
    if (cached) {
      setPrediction(cached);
      return;
    }

    const matchInfo = matchPool.find((m) => m.matchId === id);
    if (!matchInfo) return;

    setAnalyzing(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: id })
      });
      const data = await response.json();
      setPrediction(data);
      setPredictionHistory((prev) => [data, ...prev]);
    } catch (error) {
      console.error("AI execution error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedMatchObj = matches.find((m) => m.matchId === selectedMatchId);

  // Helper to format/parse markdown paragraphs cleanly
  const renderFormattedReport = (mdText: string) => {
    if (!mdText) return null;
    const lines = mdText.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("###")) {
        return (
          <h4 key={idx} className="font-mono text-xs text-[#00FF66] uppercase font-black tracking-[0.2em] mt-4 mb-2">
            {line.replace("###", "").trim()}
          </h4>
        );
      }
      if (line.startsWith("####")) {
        return (
          <h5 key={idx} className="font-mono text-[11px] text-white uppercase tracking-widest mt-3 mb-1.5 flex items-center gap-1 font-black">
            <Sparkles className="h-3.5 w-3.5 text-red-500" /> {line.replace("####", "").trim()}
          </h5>
        );
      }
      if (line.startsWith("*") || line.startsWith("-")) {
        return (
          <li key={idx} className="text-white/60 text-xs font-mono pl-4 pb-1 relative list-none">
            <span className="absolute left-0 text-[#00FF66] font-black">•</span> {line.replace(/^[\s*-]+/, "").trim()}
          </li>
        );
      }
      if (line.trim().length === 0) return null;
      return (
        <p key={idx} className="text-white/60 text-xs leading-relaxed font-mono pb-3">
          {line.trim()}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ai-predictions-root">
      {/* Control Selector Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#111] border border-white/10 rounded-none p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#00FF66]" />
          
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-[#00FF66]" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#00FF66] font-black">AI Neural Analyst</h2>
          </div>

          <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.15em] leading-normal mb-4">
            Request automated gaming telemetry analysis powered by the ArenaX year 2095 prediction core.
          </p>

          {/* Select dropdown */}
          <div className="space-y-3 mb-6">
            <label className="text-[10px] font-mono text-white/40 block uppercase tracking-wider font-bold">Select Active Arena Matchups:</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full bg-black border border-white/10 text-white rounded-none px-4 py-3 font-mono text-xs focus:border-[#00FF66] outline-none cursor-pointer"
            >
              {matches.map((m) => (
                <option key={m.matchId} value={m.matchId} className="bg-black text-white font-mono text-xs">
                  {m.teamHome} v {m.teamAway} ({m.sport})
                </option>
              ))}
            </select>
          </div>

          {/* Predict Action */}
          <button
            onClick={handlePredictClick}
            disabled={analyzing}
            className={`w-full py-3 px-4 rounded-none font-mono text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              analyzing
                ? "bg-neutral-850 text-[#00FF66] border border-[#00FF66]/30 cursor-wait"
                : "bg-[#00FF66] text-black hover:bg-[#33ffaa] shadow-lg outline-none"
            }`}
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                CONSTRUCTING TELEMETRY...
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                RUN PREDICTION CORE
              </>
            )}
          </button>
        </div>

        {/* Prediction telemetry stats logs / History */}
        <div className="bg-[#111] border border-white/10 rounded-none p-5">
          <h3 className="font-mono text-xs font-black uppercase text-white/60 tracking-[0.2em] mb-3">Simulation History</h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[11px]">
            {predictionHistory.length === 0 ? (
              <span className="text-white/40 uppercase text-[9px] font-bold block text-center py-6">No historical records computed</span>
            ) : (
              predictionHistory.map((p, idx) => {
                const matchObj = matches.find((m) => m.matchId === p.matchId);
                return (
                  <div
                    key={idx}
                    onClick={() => setPrediction(p)}
                    className="p-3 bg-black border border-white/10 hover:border-[#00FF66] rounded-none cursor-pointer flex justify-between items-center transition-all"
                  >
                    <div>
                      <span className="text-[#00FF66] block font-black uppercase truncate max-w-[155px]">
                        {matchObj ? `${matchObj.teamHome} v ${matchObj.teamAway}` : "Quantum Match"}
                      </span>
                      <span className="text-[9px] text-white/40 block uppercase mt-0.5 font-bold">Winner: {p.predictedWinner.split(' ')[0]}</span>
                    </div>
                    <span className="text-red-500 text-xs font-black bg-red-950/20 border border-red-900/40 px-2 py-0.5 rounded-none font-mono">
                      {p.confidence}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Prediction Output Results */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {prediction ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-none p-6 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Result header */}
                <div className="flex flex-wrap justify-between items-start border-b border-white/10 pb-4 mb-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 bg-black border border-white/10 flex items-center justify-center">
                      <Cpu className="h-5.5 w-5.5 text-[#00FF66]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block font-bold">Neural Network Outcome Node</span>
                      <h3 className="text-xl font-black italic tracking-tighter text-white uppercase mt-0.5">
                        {analyzing ? "REGULATING..." : `WINNER // ${prediction.predictedWinner.toUpperCase()}`}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-white/40 uppercase block font-black tracking-widest">NETWORK CONFIDENCE</span>
                    <span className="text-3xl font-black text-red-500 font-mono tracking-tighter mt-1 inline-block">
                      {prediction.confidence}%
                    </span>
                  </div>
                </div>

                {/* Combined Probability bars & stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00FF66]"></span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 font-black">Winning potential indexes</span>
                  </div>

                  <div className="bg-black border border-white/10 p-4 rounded-none space-y-3 font-mono text-[11px]">
                    {Object.entries(prediction.winProbability).map(([teamName, probability]) => (
                      <div key={teamName} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-white/80 font-black uppercase text-xs italic">{teamName}</span>
                          <span className="text-[#00FF66] font-black">{probability}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111] rounded-none overflow-hidden">
                          <div
                            className="h-full bg-[#00FF66] transition-all duration-705"
                            style={{ width: `${probability}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyst markdown text details */}
                <div className="bg-black border border-white/10 rounded-none p-5 mb-6 max-h-[380px] overflow-y-auto custom-scrollbar">
                  <div className="pb-3 mb-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[#00FF66] text-[10px] font-mono tracking-widest uppercase font-black">RECONSTRUCTED INTEL RECON</span>
                    <span className="text-white/40 text-[9px] font-mono uppercase tracking-widest font-black">SECURE DATALINK</span>
                  </div>
                  {renderFormattedReport(prediction.analystReport)}
                </div>

                {/* Simulated game timeline projection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Milestone className="h-4 w-4 text-[#00FF66]" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold">Projected match cycles timeline</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prediction.simulatedTimeline.map((item, idx) => (
                      <div key={idx} className="p-4 bg-black border border-white/10 rounded-none flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[#00FF66] text-xs font-mono font-black uppercase tracking-wider">CYCLE {item.cycle}</span>
                            <span className="text-[8px] bg-[#00FF66]/10 border border-[#00FF66]/20 px-1.5 py-0.5 rounded-none text-[#00FF66] font-mono font-bold uppercase">SIM</span>
                          </div>
                          <p className="text-[10px] font-mono text-white/80 leading-normal mt-1">{item.event}</p>
                        </div>
                        <div className="border-t border-white/10 pt-2 mt-2">
                          <span className="text-[9px] text-white/40 block uppercase font-mono font-bold">Simulated Impact</span>
                          <span className="text-[10px] font-mono text-[#00FF66] leading-tight block mt-0.5 uppercase font-black">{item.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="border border-dashed border-white/10 bg-black text-center py-24 rounded-none flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-none border border-white/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white/40" />
              </div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest block font-black">AI Predictor Core Standby</span>
              <p className="text-[10px] text-white/40 font-mono mt-1 uppercase max-w-sm leading-normal">
                Request tactical projection for any match available using the simulation control center on the left column.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
