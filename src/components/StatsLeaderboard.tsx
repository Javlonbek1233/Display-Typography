import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, ShieldAlert, Star, Compass, Filter, Zap, LayoutGrid } from "lucide-react";
import { LeaderboardTeam } from "../types";

export default function StatsLeaderboard() {
  const [standings, setStandings] = useState<LeaderboardTeam[]>([]);
  const [sportFilter, setSportFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error loading standings", err));
  }, []);

  return (
    <div className="bg-[#111] border border-white/10 rounded-none p-6 relative overflow-hidden" id="leaderboard-root">
      
      {/* Standings Header */}
      <div className="flex flex-wrap justify-between items-center pb-4 mb-6 border-b border-white/10 gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#00FF66]" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#00FF66] font-black">Grid Standings Matrix</h2>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 bg-black border border-white/10 rounded-none p-1 font-mono text-[10px]">
          <button
            onClick={() => setSportFilter("ALL")}
            className={`px-3 py-1.5 rounded-none font-black uppercase tracking-wider transition-all cursor-pointer ${
              sportFilter === "ALL"
                ? "bg-[#00FF66] text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            GLOBAL DRAFT STANDINGS
          </button>
          <button
            onClick={() => setSportFilter("HYPER")}
            className={`px-3 py-1.5 rounded-none font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              sportFilter === "HYPER"
                ? "bg-[#00FF66] text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> HYPER MATRIX STANDING
          </button>
        </div>
      </div>

      {/* Switzerland high contrast scoreboard standings grid list */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] tracking-widest pb-3">
              <th className="py-3 px-2 text-center w-12 font-black">Rank</th>
              <th className="py-3 px-2 font-black">Team Cybernetic Signal</th>
              <th className="py-3 px-2 text-center font-black">Played</th>
              <th className="py-3 px-2 text-center font-black">Won</th>
              <th className="py-3 px-2 text-center font-black">Drawn</th>
              <th className="py-3 px-2 text-center font-black">Lost</th>
              <th className="py-3 px-4 text-center font-black">Wins Break</th>
              <th className="py-3 px-2 text-right font-black">Points Value</th>
              <th className="py-3 px-4 text-right font-black">Hyper-Index Vector</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {standings
              .sort((a, b) => {
                if (sportFilter === "HYPER") {
                  return b.hyperIndex - a.hyperIndex;
                }
                return b.points - a.points;
              })
              .map((team, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                return (
                  <motion.tr
                    key={team.teamId}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center justify-center h-6 w-6 font-black rounded-none font-mono ${
                        isTopThree
                          ? "bg-[#00FF66] text-black"
                          : "text-white/40"
                      }`}>
                        {rank}
                      </span>
                    </td>

                    {/* Team Signals */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-none"
                          style={{
                            backgroundColor: team.logoColor
                          }}
                        />
                        <span className="font-black italic uppercase text-white text-sm tracking-tight">{team.name}</span>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3 px-2 text-center text-white/60 font-black">{team.played}</td>

                    {/* Won */}
                    <td className="py-3 px-2 text-center text-[#00FF66] font-black">{team.won}</td>

                    {/* Drawn */}
                    <td className="py-3 px-2 text-center text-white/40">{team.drawn}</td>

                    {/* Lost */}
                    <td className="py-3 px-2 text-center text-red-500 font-black">{team.lost}</td>

                    {/* Dynamic Graphic wins break bar */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-0.5 max-w-[80px] mx-auto">
                        {Array.from({ length: 5 }).map((_, w_idx) => {
                          let color = "bg-neutral-800";
                          if (w_idx < team.won % 5) {
                            color = "bg-[#00FF66]";
                          } else if (w_idx === team.won % 5 && team.drawn > 0) {
                            color = "bg-red-500";
                          }
                          return (
                            <span key={w_idx} className={`h-1.5 w-2.5 rounded-none ${color}`} />
                          );
                        })}
                      </div>
                    </td>

                    {/* Points value */}
                    <td className="py-3 px-2 text-right">
                      <span className="font-black text-white text-sm tracking-tight">{team.points}</span>
                    </td>

                    {/* Speed Hyper-Index Vector */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[#00FF66] font-black text-xs">{team.hyperIndex}</span>
                        <div className="h-1.5 w-12 bg-black rounded-none overflow-hidden inline-block border border-white/5">
                          <div
                            className="h-full bg-[#00FF66]"
                            style={{ width: `${team.hyperIndex}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Standings metadata footer info */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center text-[10px] text-white/40 font-mono gap-4 uppercase leading-none font-bold">
        <div className="flex items-center gap-2">
          <Star className="h-3 w-3 text-[#00FF66] fill-current" />
          <span>Top 4 Teams qualify for the 2095 CyberCup Grand Finals</span>
        </div>
        <span className="text-[9px] text-[#00FF66] font-black tracking-widest">METRICS OUT: SECURE</span>
      </div>
    </div>
  );
}
