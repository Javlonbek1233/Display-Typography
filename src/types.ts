/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum FuturisticSport {
  QUANTUM_GRID = "Quantum Grid",
  AERO_CROSS = "Drone Aero-Cross",
  SHOCKWAVE_RALLY = "Shockwave Rally",
  TITAN_MELEE = "Nexus Titan Melee"
}

export interface PlayerStats {
  id: string;
  name: string;
  role: string;
  rarity: "Standard" | "Elite" | "Legendary" | "AI-Construct";
  statPower: number;
  statSync: number;
  statSpeed: number;
  price: number;
  status: "Active" | "Charging" | "Overloaded";
}

export interface TeamStats {
  name: string;
  logoColor: string; // Neon hex code, e.g., #00ffcc
  shieldProtection: number; // 0-100
  powerDrain: number; // 0-100
  kineticSpeed: number; // 0-100
  hyperIndex: number; // overall ranking modifier
}

export interface SportMatch {
  matchId: string;
  sport: FuturisticSport;
  teamHome: string;
  teamAway: string;
  teamHomeColor: string;
  teamAwayColor: string;
  scoreHome: number;
  scoreAway: number;
  status: "LIVE" | "UPCOMING" | "CONCLUDED";
  minute: number; // Current match tick or cycle
  spectators: number; // Thousands of holospectators
  arena: string; // "Cyber-dome 09", "Nebula Stadium", "Zenith Core", etc.
  stats: {
    laserPossession: [number, number]; // home, away percentage
    plasmaShieldRemaining: [number, number];
    kineticStrikes: [number, number];
    overheatLevels: [number, number];
  };
  highlightRelay: string[]; // holographic highlights, match events
}

export interface LeaderboardTeam {
  teamId: string;
  name: string;
  logoColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  hyperIndex: number; // 0-100 speed-rating index
}

export interface UserProfile {
  userId: string;
  username: string;
  fantasyTeamName: string;
  points: number;
  credits: number; // To buy players
  roster: PlayerStats[];
}

export interface AiPrediction {
  matchId: string;
  predictedWinner: string;
  confidence: number; // Percentage
  winProbability: { [key: string]: number }; // home vs away win probabilities
  analystReport: string; // Complete Markdown detailed analysis report from Gemini
  simulatedTimeline: {
    cycle: number;
    event: string;
    impact: string;
  }[];
  generatedAt: string;
}
