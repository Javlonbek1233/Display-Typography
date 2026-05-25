import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Wallet, Trophy, UserPlus, Trash2, ArrowUpRight, Check, ShieldAlert } from "lucide-react";
import { PlayerStats, UserProfile } from "../types";

export default function FantasyArena() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("arenax_fantasy_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // default
      }
    }
    return {
      userId: "user-current",
      username: "JavlonX_GridLord",
      fantasyTeamName: "GRID STRIKER X",
      points: 742,
      credits: 2500,
      roster: []
    };
  });

  const [marketPlayers, setMarketPlayers] = useState<PlayerStats[]>([]);
  const [newsfeed, setNewsfeed] = useState<string[]>([
    "Transfer matrix initialised: Free agent rosters open.",
    "Draft window is open. High sync-index players currently available."
  ]);
  const [editTeamName, setEditTeamName] = useState(false);
  const [tempTeamName, setTempTeamName] = useState(profile.fantasyTeamName);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("arenax_fantasy_profile", JSON.stringify(profile));
  }, [profile]);

  // Fetch transfers market
  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setMarketPlayers(data))
      .catch((err) => console.error("Error loading Transfer players", err));
  }, []);

  const changeTeamName = () => {
    if (tempTeamName.trim().length > 3) {
      setProfile((prev) => ({ ...prev, fantasyTeamName: tempTeamName }));
      setEditTeamName(false);
      pushLog(`Team signal updated to [${tempTeamName.toUpperCase()}].`);
    }
  };

  const pushLog = (msg: string) => {
    setNewsfeed((prev) => [msg, ...prev].slice(0, 5));
  };

  const buyPlayer = (player: PlayerStats) => {
    // Check if duplicate already exists on roster
    if (profile.roster.some((p) => p.id === player.id)) {
      alert("This professional cyber-athlete is already registered in your squad roster!");
      return;
    }
    // Check budget
    if (profile.credits < player.price) {
      alert("Insufficient ArenaX Credits! Run simulation or check market indicators.");
      return;
    }
    // Spend
    setProfile((prev) => ({
      ...prev,
      credits: prev.credits - player.price,
      roster: [...prev.roster, player]
    }));
    pushLog(`RECRUITED: [${player.name}] acquired for ${player.price} credits.`);
  };

  const sellPlayer = (player: PlayerStats) => {
    const recoveryRate = 0.8;
    const valueRecovered = Math.floor(player.price * recoveryRate);
    setProfile((prev) => ({
      ...prev,
      credits: prev.credits + valueRecovered,
      roster: prev.roster.filter((p) => p.id !== player.id)
    }));
    pushLog(`RETIRED: [${player.name}] sold back to global draft for ${valueRecovered} credits.`);
  };

  // Run live simulation on user squad players to gain overall score points
  const [calculating, setCalculating] = useState(false);
  const calculatePointsImpact = () => {
    if (profile.roster.length === 0) {
      alert("recruit cyber-athletes to your roster first to calculate dynamic field sync impact!");
      return;
    }
    setCalculating(true);
    setTimeout(() => {
      // Calculate gains
      let extraPoints = 0;
      profile.roster.forEach((p) => {
        const statsAvg = (p.statPower + p.statSpeed + p.statSync) / 3;
        const gain = Math.floor((statsAvg / 10) * (Math.random() * 3 + 1));
        extraPoints += gain;
      });

      setProfile((prev) => ({
        ...prev,
        points: prev.points + extraPoints,
        credits: prev.credits + Math.floor(extraPoints * 1.5) // earn some money too!
      }));

      pushLog(`Dynamic Score computed: Roster synergy produced +${extraPoints} league points & +${Math.floor(extraPoints * 1.5)} bonus credits!`);
      setCalculating(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" id="fantasy-arena-root">
      {/* Current Team & Stats Panel */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-[#111] border border-white/10 rounded-none p-6 relative overflow-hidden">
          {/* User profile details */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="h-10 w-10 rounded-none bg-black border border-[#00FF66] flex items-center justify-center">
              <User className="h-5 w-5 text-[#00FF66]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] block">AREX CO-ORDINATES</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white truncate max-w-[150px] uppercase">{profile.username}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-none bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 uppercase font-mono font-bold">DRAFT MANAGER</span>
              </div>
            </div>
          </div>

          {/* Roster Squad Name */}
          <div className="mb-4">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1 tracking-widest">Squad Cyber-Signal</span>
            {editTeamName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempTeamName}
                  onChange={(e) => setTempTeamName(e.target.value)}
                  maxLength={25}
                  className="bg-black border border-[#00FF66] text-white rounded-none px-2 py-1 text-xs outline-none flex-1 font-mono uppercase"
                />
                <button
                  onClick={changeTeamName}
                  className="p-1.5 rounded-none bg-[#00FF66] text-black text-xs hover:bg-[#33ffaa] font-black cursor-pointer"
                >
                  <Check className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-black border border-white/10 rounded-none p-2.5">
                <span className="font-mono text-xs text-[#00FF66] font-bold tracking-widest">{profile.fantasyTeamName}</span>
                <button
                  onClick={() => {
                    setTempTeamName(profile.fantasyTeamName);
                    setEditTeamName(true);
                  }}
                  className="text-[9px] font-mono text-[#00FF66] hover:text-white underline font-black uppercase"
                >
                  MUTATE
                </button>
              </div>
            )}
          </div>

          {/* Roster Score metrics */}
          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="p-3 bg-black rounded-none border border-white/10">
              <div className="flex items-center gap-1.5 mb-1 text-white/40">
                <Wallet className="h-4 w-4 text-[#00FF66]" />
                <span className="text-[9px] uppercase tracking-wider font-mono">Credits</span>
              </div>
              <span className="text-2xl font-black text-white font-mono">{profile.credits} <span className="text-white/40 text-[10px]">AXC</span></span>
            </div>

            <div className="p-3 bg-black rounded-none border border-white/10">
              <div className="flex items-center gap-1.5 mb-1 text-white/40">
                <Trophy className="h-4 w-4 text-[#00FF66]" />
                <span className="text-[9px] uppercase tracking-wider font-mono">League Pts</span>
              </div>
              <span className="text-2xl font-black text-[#00FF66] font-mono">{profile.points} <span className="text-white/40 text-[10px]">PTS</span></span>
            </div>
          </div>

          {/* Action button to simulate point calculates */}
          <button
            onClick={calculatePointsImpact}
            disabled={calculating}
            className={`w-full py-3 px-4 rounded-none font-mono text-xs font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
              calculating
                ? "bg-neutral-800 text-[#00FF66] border border-[#00FF66]/30 cursor-wait"
                : "bg-[#00FF66] text-black hover:bg-[#33ffaa] shadow-lg outline-none"
            }`}
          >
            {calculating ? "DECODING SYNERGY MATRIX..." : "COMPUTE FIELD SYNERGY"}
          </button>
        </div>

        {/* Transfer Hub Status logs */}
        <div className="bg-[#111] border border-white/10 rounded-none p-4">
          <div className="flex items-center gap-1.5 mb-3 text-[#00FF66] font-mono font-black">
            <ShieldAlert className="h-4 w-4 stroke-2" />
            <h3 className="text-[10px] uppercase tracking-[0.2em]">Live Signal Feed</h3>
          </div>
          <div className="space-y-2 bg-black rounded-none p-3 max-h-[140px] overflow-y-auto custom-scrollbar font-mono text-[10px] text-white/60">
            {newsfeed.map((log, idx) => (
              <div key={idx} className="flex gap-2 items-start pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                <span className="text-[#00FF66]">&gt;</span>
                <span className="leading-tight">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recruited Draft Squad & Global Transfers Roster */}
      <div className="xl:col-span-8 space-y-6">
        {/* Recruited Squad list */}
        <div className="bg-[#111] border border-white/10 rounded-none p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-xs font-black uppercase text-white/60 tracking-wider">Registered Cyber-Athletes ({profile.roster.length}/4)</h3>
            <span className="text-[10px] font-mono text-[#00FF66] font-black tracking-widest">MAXIMUM: 4 SLOTS</span>
          </div>

          {profile.roster.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-none bg-black">
              <span className="text-xs font-mono text-[#00FF66] font-black uppercase tracking-widest block">SQUAD IS EMPTY</span>
              <p className="text-[10px] text-white/40 font-mono mt-1 uppercase max-w-sm mx-auto leading-normal">
                recruit active players from the ArenaX draft market below to form your tactical league lineup.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {profile.roster.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-none border border-white/10 bg-black relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-black italic tracking-tighter text-white uppercase">{player.name}</h4>
                          <span className="text-[10px] text-[#00FF66] font-mono font-bold block mt-0.5 uppercase tracking-wider">{player.role}</span>
                        </div>
                        <span className="text-[9px] font-mono font-black tracking-widest px-2 py-0.5 rounded-none bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 uppercase">
                          {player.rarity}
                        </span>
                      </div>

                      {/* Performance Indicators */}
                      <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-[#111] border border-white/5 rounded-none text-center font-mono">
                        <div>
                          <span className="text-[8px] text-white/40 uppercase block font-bold">Power</span>
                          <span className="text-xs text-white font-black">{player.statPower}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-white/40 uppercase block font-bold">Sync</span>
                          <span className="text-xs text-[#00FF66] font-black">{player.statSync}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-white/40 uppercase block font-bold">Speed</span>
                          <span className="text-xs text-red-500 font-black">{player.statSpeed}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-1">
                      <span className="text-[9px] font-mono text-white/40 uppercase font-bold">
                        REFUND RECOVERY rate ~ 80%
                      </span>
                      <button
                        onClick={() => sellPlayer(player)}
                        className="text-xs font-mono font-black text-red-500 flex items-center gap-1 px-2.5 py-1 rounded-none bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 outline-none cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> RETIRE
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Global Transfer Draft Market */}
        <div className="bg-[#111] border border-white/10 rounded-none p-5">
          <h3 className="font-mono text-xs font-black uppercase text-white/60 tracking-[0.2em] mb-4 border-b border-white/10 pb-2">ArenaX Transfer Draft Board</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {marketPlayers.map((player) => {
              const isOwned = profile.roster.some((p) => p.id === player.id);
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-none border flex flex-col justify-between transition-all ${
                    isOwned
                      ? "bg-[#090a09] border-[#00FF66]/30 opacity-80"
                      : "bg-[#050505] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-base font-black italic tracking-tighter text-white uppercase truncate max-w-[150px]">{player.name}</h4>
                        <span className="text-[10px] text-[#00FF66] font-mono block uppercase font-bold tracking-wider">{player.role}</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 font-bold rounded-none bg-white/5 text-white/80 border border-white/10 uppercase">
                        {player.rarity}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between gap-2 py-1.5 border-t border-white/15 font-mono text-[9px] text-white/40 uppercase font-black">
                      <span>POWER <b className="text-white font-black">{player.statPower}</b></span>
                      <span>SYNC <b className="text-[#00FF66] font-black">{player.statSync}</b></span>
                      <span>SPEED <b className="text-red-500 font-black">{player.statSpeed}</b></span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-2">
                    <span className="text-sm text-[#00FF66] font-black font-mono">
                      {player.price} <span className="text-white/40 text-[9px]">AXC</span>
                    </span>

                    {isOwned ? (
                      <span className="text-[10px] font-mono text-[#00FF66] flex items-center gap-1 font-black tracking-widest">
                        <Check className="h-3.5 w-3.5" /> RECRUITED
                      </span>
                    ) : (
                      <button
                        onClick={() => buyPlayer(player)}
                        disabled={profile.roster.length >= 4}
                        className="text-xs font-mono text-black font-black bg-[#00FF66] hover:bg-[#33ffaa] active:scale-95 disabled:bg-neutral-800 disabled:text-white/20 disabled:scale-100 transition-all px-3 py-1.5 rounded-none flex items-center gap-1 outline-none cursor-pointer"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> RECRUIT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
