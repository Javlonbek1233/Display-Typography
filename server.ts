import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in the secrets panel. Live AI predictions will require setup.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Memory-based state for live simulation
let matches: {
  matchId: string;
  sport: string;
  teamHome: string;
  teamAway: string;
  teamHomeColor: string;
  teamAwayColor: string;
  scoreHome: number;
  scoreAway: number;
  status: "LIVE" | "UPCOMING" | "CONCLUDED";
  minute: number;
  spectators: number;
  arena: string;
  stats: {
    laserPossession: [number, number];
    plasmaShieldRemaining: [number, number];
    kineticStrikes: [number, number];
    overheatLevels: [number, number];
  };
  highlightRelay: string[];
}[] = [
  {
    matchId: "match-1",
    sport: "Quantum Grid",
    teamHome: "Neo Tokyo Vanguard",
    teamAway: "Grid Sector 8",
    teamHomeColor: "#00ffcc", // Neon Cyan
    teamAwayColor: "#ff0077", // Neon Hot Pink
    scoreHome: 2,
    scoreAway: 1,
    status: "LIVE",
    minute: 42,
    spectators: 142.5,
    arena: "Chiba Quantum Dome (Tokyo)",
    stats: {
      laserPossession: [58, 42] as [number, number],
      plasmaShieldRemaining: [84, 62] as [number, number],
      kineticStrikes: [14, 9] as [number, number],
      overheatLevels: [34, 52] as [number, number],
    },
    highlightRelay: [
      "[Cycle 05] ArenaX match lock in: Kinetic drive activated.",
      "[Cycle 18] Laser-field disruption: Vanguard strikes deep with Plasma Pulse. Home team registers +1.",
      "[Cycle 28] Pink Counter-blast: Offence overload from Grid Sector 8. Heavy shield depletion at gate wall.",
      "[Cycle 35] Grid Sector 8 strikes back! Cyber-striker V-4 punctures shielding. Away team registers +1.",
      "[Cycle 39] Kinetic Orb instability: Vanguard scores high-velocity rebound. Home team registers +1."
    ]
  },
  {
    matchId: "match-2",
    sport: "Drone Aero-Cross",
    teamHome: "Solar Raiders",
    teamAway: "Zenith Velocity",
    teamHomeColor: "#ffaa00", // Neon Orange
    teamAwayColor: "#0088ff", // Neon Bright Blue
    scoreHome: 52,
    scoreAway: 58,
    status: "LIVE",
    minute: 74,
    spectators: 89.4,
    arena: "Stratosphere Ring-Core Alpha",
    stats: {
      laserPossession: [45, 55] as [number, number],
      plasmaShieldRemaining: [41, 79] as [number, number],
      kineticStrikes: [31, 38] as [number, number],
      overheatLevels: [78, 65] as [number, number],
    },
    highlightRelay: [
      "[Gate 12] Vortex turbulences encountered by Zenith squadron leader.",
      "[Gate 31] Solar Raiders initiate double barrel gate slide: points multiply by 1.5x.",
      "[Gate 45] Zenith swarm drones lock triple boost chain. Score jumps by 15 points.",
      "[Gate 62] High-altitude intercept: Heavy drone contact near ring tower.",
      "[Gate 71] Zenith pilot logs hyper-drive gate maneuver. Crowd roar hologram peaks."
    ]
  },
  {
    matchId: "match-3",
    sport: "Shockwave Rally",
    teamHome: "Plasma Sparks",
    teamAway: "Proton Pulse",
    teamHomeColor: "#cc00ff", // Neon Purple
    teamAwayColor: "#33ff11", // Neon Green
    scoreHome: 0,
    scoreAway: 0,
    status: "UPCOMING",
    minute: 0,
    spectators: 110.0,
    arena: "Zenith Suboceanic Arena",
    stats: {
      laserPossession: [50, 50] as [number, number],
      plasmaShieldRemaining: [100, 100] as [number, number],
      kineticStrikes: [0, 0] as [number, number],
      overheatLevels: [0, 0] as [number, number],
    },
    highlightRelay: [
      "[Match Scheduled] Pre-match tactical load completed. Energy field charging."
    ]
  },
  {
    matchId: "match-4",
    sport: "Nexus Titan Melee",
    teamHome: "Apex Mech Brigade",
    teamAway: "Giga-Forge Titans",
    teamHomeColor: "#00ffd5", // Mint Neon
    teamAwayColor: "#ff3c00", // Fire Red Neon
    scoreHome: 0,
    scoreAway: 0,
    status: "UPCOMING",
    minute: 0,
    spectators: 220.5,
    arena: "Titan Industrial Colosseum",
    stats: {
      laserPossession: [50, 50] as [number, number],
      plasmaShieldRemaining: [100, 100] as [number, number],
      kineticStrikes: [0, 0] as [number, number],
      overheatLevels: [0, 0] as [number, number],
    },
    highlightRelay: [
      "[Pre-Ignition] Core thruster diagnostics run: 100% stable."
    ]
  },
  {
    matchId: "match-5",
    sport: "Drone Aero-Cross",
    teamHome: "Chronos Speedsters",
    teamAway: "Nebula Outlaws",
    teamHomeColor: "#ffea00", // Yellow Neon
    teamAwayColor: "#b200ff", // Dark Violet Neon
    scoreHome: 112,
    scoreAway: 104,
    status: "CONCLUDED",
    minute: 90,
    spectators: 104.2,
    arena: "Nebula Gas-Field Colosseum",
    stats: {
      laserPossession: [52, 48] as [number, number],
      plasmaShieldRemaining: [12, 0] as [number, number],
      kineticStrikes: [89, 81] as [number, number],
      overheatLevels: [94, 99] as [number, number],
    },
    highlightRelay: [
      "[Entry] Cyber-wind shear exceeds safe threshold. Race cleared.",
      "[Phase 1] Speedsters capitalize on slipstream gate tracking.",
      "[Phase 2] Outlaws activate weaponized magnetic flares, securing 4 consecutive speed gates.",
      "[Phase 3] Thrilling terminal finish. Speedsters override safety limits to secure gold shield gate. Victory."
    ]
  }
];

const LEADERBOARD = [
  { teamId: "lb-1", name: "Zenith Velocity", logoColor: "#0088ff", played: 14, won: 11, drawn: 1, lost: 2, points: 34, hyperIndex: 94.2 },
  { teamId: "lb-2", name: "Neo Tokyo Vanguard", logoColor: "#00ffcc", played: 14, won: 10, drawn: 2, lost: 2, points: 32, hyperIndex: 91.8 },
  { teamId: "lb-3", name: "Solar Raiders", logoColor: "#ffaa00", played: 14, won: 8, drawn: 3, lost: 3, points: 27, hyperIndex: 88.5 },
  { teamId: "lb-4", name: "Grid Sector 8", logoColor: "#ff0077", played: 14, won: 7, drawn: 2, lost: 5, points: 23, hyperIndex: 85.1 },
  { teamId: "lb-5", name: "Apex Mech Brigade", logoColor: "#00ffd5", played: 14, won: 6, drawn: 3, lost: 5, points: 21, hyperIndex: 81.3 },
  { teamId: "lb-6", name: "Giga-Forge Titans", logoColor: "#ff3c00", played: 14, won: 5, drawn: 1, lost: 8, points: 16, hyperIndex: 78.4 },
  { teamId: "lb-7", name: "Proton Pulse", logoColor: "#33ff11", played: 14, won: 4, drawn: 2, lost: 8, points: 14, hyperIndex: 72.9 },
  { teamId: "lb-8", name: "Plasma Sparks", logoColor: "#cc00ff", played: 14, won: 3, drawn: 1, lost: 10, points: 10, hyperIndex: 68.0 }
];

const TRANSFER_MARKET_PLAYERS = [
  { id: "p-1", name: "ZX-800 Striker", role: "Striker", rarity: "Elite" as const, statPower: 88, statSync: 91, statSpeed: 95, price: 820, status: "Active" as const },
  { id: "p-2", name: "Kaelen Vane", role: "Guardian", rarity: "Legendary" as const, statPower: 96, statSync: 98, statSpeed: 82, price: 1200, status: "Active" as const },
  { id: "p-3", name: "Lyra Frost (Proton)", role: "Midfield Linker", rarity: "AI-Construct" as const, statPower: 85, statSync: 99, statSpeed: 92, price: 1450, status: "Active" as const },
  { id: "p-4", name: "Jax Gridbreaker", role: "Brawler", rarity: "Standard" as const, statPower: 79, statSync: 70, statSpeed: 75, price: 350, status: "Active" as const },
  { id: "p-5", name: "Nova Vanguard (V3)", role: "Interceptor", rarity: "Elite" as const, statPower: 92, statSync: 85, statSpeed: 89, price: 790, status: "Active" as const },
  { id: "p-6", name: "Pulse-S1 Cyber", role: "Striker", rarity: "Standard" as const, statPower: 74, statSync: 80, statSpeed: 86, price: 410, status: "Active" as const },
  { id: "p-7", name: "T-99 Chrono-Gatekeeper", role: "Guardian", rarity: "AI-Construct" as const, statPower: 98, statSync: 95, statSpeed: 70, price: 1500, status: "Charging" as const },
  { id: "p-8", name: "Aria Sparks", role: "Midfield Linker", rarity: "Elite" as const, statPower: 82, statSync: 94, statSpeed: 90, price: 720, status: "Active" as const }
];

// Continuous Simulation Loop to simulate a hyper sports environment
setInterval(() => {
  matches = matches.map(m => {
    if (m.status !== "LIVE") return m;

    let newMinute = m.minute + 1;
    let newStatus: "LIVE" | "UPCOMING" | "CONCLUDED" = m.status;
    let newScoreHome = m.scoreHome;
    let newScoreAway = m.scoreAway;
    let highlights = [...m.highlightRelay];

    if (newMinute >= 90) {
      newStatus = "CONCLUDED";
      newMinute = 90;
      highlights.push(`[SYSTEM CHRONO] Terminal cycle achieved. Match concluded. Final score ${m.teamHome} ${newScoreHome} - ${newScoreAway} ${m.teamAway}.`);
    } else {
      // Small chance of scores
      const rand = Math.random();
      const isAero = m.sport === "Drone Aero-Cross";
      const scoreChance = isAero ? 0.22 : 0.08; // Aero-Cross is high score

      if (rand < scoreChance) {
        // Point scored!
        const scorer = Math.random() > 0.45 ? "home" : "away";
        const pointAmount = isAero ? Math.floor(Math.random() * 8) + 3 : 1;

        if (scorer === "home") {
          newScoreHome += pointAmount;
          const detail = isAero
            ? `[Cycle ${newMinute}] Solar Raiders pilot launches Hyper-Glide maneuver through dual ring scoregate! (${pointAmount} PTS)`
            : `[Cycle ${newMinute}] ${m.teamHome} lasers a rapid-plasma orb behind the shield barrier! Goal registered.`;
          highlights.push(detail);
        } else {
          newScoreAway += pointAmount;
          const detail = isAero
            ? `[Cycle ${newMinute}] Away squadron fires a precision EMP-blast, disabling interceptors to gain (${pointAmount} PTS)`
            : `[Cycle ${newMinute}] ${m.teamAway} interceptor overloads the front generator, punching through. Goal registered.`;
          highlights.push(detail);
        }
      }

      // Update state live-feel metrics
      const homePoss = Math.min(85, Math.max(15, m.stats.laserPossession[0] + (Math.random() > 0.5 ? 2 : -2)));
      const awayPoss = 100 - homePoss;

      const newHomeShield = Math.max(0, m.stats.plasmaShieldRemaining[0] - Math.floor(Math.random() * 3));
      const newAwayShield = Math.max(0, m.stats.plasmaShieldRemaining[1] - Math.floor(Math.random() * 3));

      const newHomeStrikes = m.stats.kineticStrikes[0] + (Math.random() > 0.7 ? 1 : 0);
      const newAwayStrikes = m.stats.kineticStrikes[1] + (Math.random() > 0.7 ? 1 : 0);

      const newHomeOverheat = Math.min(100, Math.max(10, m.stats.overheatLevels[0] + (Math.random() > 0.5 ? 4 : -3)));
      const newAwayOverheat = Math.min(100, Math.max(10, m.stats.overheatLevels[1] + (Math.random() > 0.5 ? 4 : -3)));

      return {
        ...m,
        minute: newMinute,
        status: newStatus,
        scoreHome: newScoreHome,
        scoreAway: newScoreAway,
        highlightRelay: highlights.slice(-8), // Keep only last 8 events for performance & UI clarity
        stats: {
          laserPossession: [homePoss, awayPoss] as [number, number],
          plasmaShieldRemaining: [newHomeShield, newAwayShield] as [number, number],
          kineticStrikes: [newHomeStrikes, newAwayStrikes] as [number, number],
          overheatLevels: [newHomeOverheat, newAwayOverheat] as [number, number]
        }
      };
    }

    return {
      ...m,
      minute: newMinute,
      status: newStatus,
      scoreHome: newScoreHome,
      scoreAway: newScoreAway,
      highlightRelay: highlights
    };
  });
}, 8000); // simulation interval

// REST endpoints
app.get("/api/matches", (req, res) => {
  res.json(matches);
});

app.get("/api/leaderboard", (req, res) => {
  res.json(LEADERBOARD);
});

app.get("/api/players", (req, res) => {
  res.json(TRANSFER_MARKET_PLAYERS);
});

// Reset matches command
app.post("/api/matches/reset", (req, res) => {
  matches = matches.map((m, idx) => {
    if (idx === 0) {
      return {
        ...m,
        scoreHome: 2,
        scoreAway: 1,
        status: "LIVE" as const,
        minute: 42,
        highlightRelay: [
          "[Cycle 05] ArenaX match lock in: Kinetic drive activated.",
          "[Cycle 18] Laser-field disruption: Vanguard strikes deep with Plasma Pulse. Home team registers +1.",
          "[Cycle 28] Pink Counter-blast: Offence overload from Grid Sector 8. Heavy shield depletion at gate wall."
        ],
        stats: {
          laserPossession: [55, 45] as [number, number],
          plasmaShieldRemaining: [80, 70] as [number, number],
          kineticStrikes: [10, 8] as [number, number],
          overheatLevels: [30, 45] as [number, number]
        }
      };
    }
    if (idx === 1) {
      return {
        ...m,
        scoreHome: 45,
        scoreAway: 52,
        status: "LIVE" as const,
        minute: 68,
        highlightRelay: [
          "[Gate 12] Vortex turbulences encountered by Zenith squadron leader.",
          "[Gate 31] Solar Raiders initiate double barrel gate slide: points multiply by 1.5x."
        ],
        stats: {
          laserPossession: [48, 52] as [number, number],
          plasmaShieldRemaining: [60, 80] as [number, number],
          kineticStrikes: [25, 30] as [number, number],
          overheatLevels: [60, 55] as [number, number]
        }
      };
    }
    if (idx === 2 || idx === 3) {
      return {
        ...m,
        status: "UPCOMING" as const,
        minute: 0,
        scoreHome: 0,
        scoreAway: 0,
        highlightRelay: ["[Match Scheduled] Pre-match tactical load completed. Energy field charging."]
      };
    }
    return m;
  });
  res.json({ success: true, matches });
});

// Server-side AI Predictions using @google/genai
app.post("/api/predict", async (req, res) => {
  try {
    const { matchId } = req.body;
    const match = matches.find(m => m.matchId === matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const aiClient = getGeminiClient();
    if (!aiClient) {
      // Fallback prediction if Gemini SDK hasn't been configured yet
      const mockPrediction = generateLocalFallback(match);
      return res.json({
        ...mockPrediction,
        isFallback: true,
        note: `AI key not configured inSecrets. Generating high-fidelity Quantum Engine offline analysis.`
      });
    }

    // Modern @google/genai structured call using Schema
    const systemPrompt = `You are "ArenaX AI Terminal", a hyper-advanced futuristic neural sports analyst computed in the year 2095. 
Your tone is deeply analytical, high-tech, precise, energetic, and cybernetic. Use sport-themed sci-fi jargon (shield integrity, plasma-orbs, telemetry sync, cybernetic enhancements).
Analyze the sports matchup and return a JSON matching the following structure exact schema:
type: object
properties:
  matchId: string (must match input matchId)
  predictedWinner: string (must match home team name or away team name)
  confidence: number (confidence score from 0 to 100)
  winProbability: logo-based percentage distribution object e.g., {"home_team_name": 65, "away_team_name": 35}
  analystReport: string (A solid markdown format report outlining tactical strategies, key cybernetics, arena environmental factors, and final match prediction breakdown)
  simulatedTimeline: array of simulated next-cycle highlights from future gameplay, containing properties:
    cycle: number (between 75 and 90)
    event: string (cool sci-fi sport play description)
    impact: string (impact statement)`;

    const userPrompt = `Match Meta:
Sport: ${match.sport}
Arena: ${match.arena}
Home: ${match.teamHome} vs Away: ${m => match.teamAway}
Current score: ${match.scoreHome} - ${match.scoreAway}
Current status/minute: ${match.status} / Tick ${match.minute}
Possession rates: ${match.stats.laserPossession[0]}% - ${match.stats.laserPossession[1]}%
Shield remaining: ${match.stats.plasmaShieldRemaining[0]}% - ${match.stats.plasmaShieldRemaining[1]}%
Please generate an analytical projection of tactical outcomes and simulate structural performance variables of this matchup.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchId: { type: Type.STRING },
            predictedWinner: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            winProbability: {
              type: Type.OBJECT,
              properties: {
                home: { type: Type.INTEGER, description: "Home team win percentage representation" },
                away: { type: Type.INTEGER, description: "Away team win percentage representation" }
              },
              required: ["home", "away"]
            },
            analystReport: { type: Type.STRING, description: "Deep analysis in markdown style" },
            simulatedTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cycle: { type: Type.INTEGER },
                  event: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["cycle", "event", "impact"]
              }
            }
          },
          required: ["matchId", "predictedWinner", "confidence", "winProbability", "analystReport", "simulatedTimeline"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);

    // Format winProbability object to use team names directly or standard formatting
    const formattedProbability: { [key: string]: number } = {};
    formattedProbability[match.teamHome] = parsed.winProbability?.home || 50;
    formattedProbability[match.teamAway] = parsed.winProbability?.away || 50;

    res.json({
      matchId: match.matchId,
      predictedWinner: parsed.predictedWinner || (parsed.confidence > 50 ? match.teamHome : match.teamAway),
      confidence: parsed.confidence || 75,
      winProbability: formattedProbability,
      analystReport: parsed.analystReport || "Unable to compute deep telemetry.",
      simulatedTimeline: parsed.simulatedTimeline || [],
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Gemini Sports Prediction Error:", error);
    res.status(500).json({
      error: "AI prediction compilation failed. Reverting to local tactical fallback engine.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Local Fallback Generator
function generateLocalFallback(match: typeof matches[0]) {
  const homeAdv = match.stats.laserPossession[0] / 100 + match.stats.plasmaShieldRemaining[0] / 200;
  const awayAdv = match.stats.laserPossession[1] / 100 + match.stats.plasmaShieldRemaining[1] / 200;
  const total = homeAdv + awayAdv;
  const homeProb = Math.round((homeAdv / total) * 100);
  const awayProb = 100 - homeProb;

  const predictedWinner = homeProb >= awayProb ? match.teamHome : match.teamAway;
  const confidence = Math.abs(homeProb - awayProb) + 40;

  const analystReport = `### 🚀 ArenaX Tactical Prediction: ${match.teamHome} vs. ${match.teamAway}

**Simulation Index**: HIGH RESONANCE (98.2% Offline Accuracy)

#### Tactical Evaluation
* **${match.teamHome} Strategy**: Activating a multi-phase gridlock strategy. Their current possession rates (${match.stats.laserPossession[0]}%) suggest high orbital control. In the **${match.sport}** sphere, they excel at close-range particle collisions.
* **${match.teamAway} Strategy**: Rebuilding plasma shielding, matching at ${match.stats.plasmaShieldRemaining[1]}%. Their playstyle is heavy and kinetic, relying on fast counters rather than gate positioning.

#### Arena Constraints: ${match.arena}
The heavy gravity and hyper-baric holographic filters in this stadium favor high mechanical performance index teams. Speed rating indices will play a key factor in the remaining periods. 

#### Recommendation Summary
Vanguard predictions show a tight win margin for **${predictedWinner}** with a calculated **${confidence}%** local network confidence. Prepare user rosters accordingly.`;

  return {
    matchId: match.matchId,
    predictedWinner,
    confidence,
    winProbability: {
      [match.teamHome]: homeProb,
      [match.teamAway]: awayProb
    },
    analystReport,
    simulatedTimeline: [
      {
        cycle: Math.max(match.minute + 3, 76),
        event: `Holographic grid detects high kinetic thrust from ${predictedWinner} prime Striker.`,
        impact: "Vanguard shields down by 14%."
      },
      {
        cycle: Math.max(match.minute + 10, 84),
        event: "Atmospheric storm simulation spikes. Field control vectors offset by +8 units.",
        impact: "Possession rebalances."
      },
      {
        cycle: 89,
        event: `Absolute terminal collision at the goal-gate by ${predictedWinner}.`,
        impact: "Match point registered."
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ArenaX server running on port ${PORT}`);
  });
}

startServer();
