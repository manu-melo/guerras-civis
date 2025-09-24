// src/types/game.ts

export type Role =
  // Civis
  | "Juiz"
  | "Policial"
  | "Anjo"
  | "Detetive"
  | "Aldeão"
  | "Fada"
  | "Espírito Vingativo"
  | "Escudeiro"
  | "Coringa"
  // Máfias
  | "Assassino"
  | "Aprendiz"
  | "Silenciador"
  | "Paralisador"
  | "Bruxa"
  | "Paparazzi"
  | "Homem-bomba"
  | "Psicopata"
  | "Demônio";

export type Team = "CIVIL" | "MAFIA";

export interface Player {
  id: string; // uuid
  nick: string;
  alive: boolean;
  role?: Role;
  team?: Team;
  votes?: number;
  originalRole?: Role; // Para Demônio e Coringa
  meta?: Record<string, unknown>; // Para dados extras como envenenamento, poderes herdados, etc.
}

export type ActionStatus = "VALID" | "ANULLED" | "NEUTRAL";

export type ActionType =
  | "ASSASSINAR" // Assassino, Aprendiz
  | "SILENCIAR" // Silenciador
  | "PARALISAR" // Paralisador
  | "PROTEGER" // Anjo
  | "INVESTIGAR" // Detetive
  | "FOTOGRAFAR" // Paparazzi
  | "POSSUIR" // Demônio
  | "DEFENDER" // Escudeiro
  | "EXECUTAR" // Juiz
  | "PRENDER" // Policial
  | "FADAR" // Fada
  | "PSICOPATIZAR"; // Psicopata

export interface Action {
  id: string;
  actorId: string;
  actorRole: Role;
  targetId: string;
  targetRole?: Role;
  type: ActionType;
  timestamp: number;
  status: ActionStatus;
  meta?: Record<string, unknown>; // ex: dieValue, reason, eliminatedPlayers
  order: number; // ordem de submissão
}

export type MessageLevel =
  | "INFO"
  | "ACTION_VALID"
  | "ACTION_ANULLED"
  | "NEUTRAL"
  | "ELIMINATION";

export interface Message {
  id: string;
  createdAt: number;
  level: MessageLevel;
  text: string;
  data?: Record<string, unknown>;
}

export type GamePhase =
  | "SETUP"
  | "NIGHT"
  | "EVENTS"
  | "DAY"
  | "VOTING"
  | "TIE_BREAKER"
  | "SPIRIT_REVENGE"
  | "GAME_OVER";

export interface GameState {
  phase: GamePhase;
  round: number; // número da rodada (noite/dia)
  hostNick: string;
  players: Player[];
  actions: Action[];
  messages: Message[];
  votes: Record<string, number>; // playerId -> vote count
  isVotingActive: boolean;
  winningTeam?: Team;
  gameStarted: boolean;
  civilPercentage: number;
  mafiaPercentage: number;
  isPiPEnabled: boolean;
  tiedPlayers?: Player[]; // Para resolver empates
  eliminatedSpiritPlayer?: Player; // Para vingança do Espírito Vingativo
}

export interface VoteResult {
  outcome: "ELIMINATED" | "TIE" | "NONE";
  players: Player[];
  tied?: Player[];
}

// Dados dos cargos
export interface RoleData {
  name: Role;
  team: Team;
  description: string;
  nightAction?: boolean;
  canTargetSelf?: boolean;
}

// Configuração do Coringa baseada no dado
export interface JokerMapping {
  diceValue: number;
  role: Role;
  team: Team;
}

// Exceções para regra de múltiplas ações
export const EXCEPTION_ROLES: Role[] = [
  // Civis
  "Policial",
  "Detetive",
  "Fada",
  "Escudeiro",
  // Máfias
  "Paralisador",
  "Paparazzi",
  "Demônio",
];

// Cargos de cada time
export const CIVIL_ROLES: Role[] = [
  "Juiz",
  "Policial",
  "Anjo",
  "Detetive",
  "Aldeão",
  "Fada",
  "Espírito Vingativo",
  "Escudeiro",
  "Coringa",
];

export const MAFIA_ROLES: Role[] = [
  "Assassino",
  "Aprendiz",
  "Silenciador",
  "Paralisador",
  "Bruxa",
  "Paparazzi",
  "Homem-bomba",
  "Psicopata",
  "Demônio",
];

// Mapeamento do Coringa
export const JOKER_MAPPINGS: JokerMapping[] = [
  { diceValue: 1, role: "Assassino", team: "CIVIL" },
  { diceValue: 2, role: "Silenciador", team: "CIVIL" },
  { diceValue: 3, role: "Paralisador", team: "CIVIL" },
  { diceValue: 4, role: "Anjo", team: "CIVIL" },
  { diceValue: 5, role: "Detetive", team: "CIVIL" },
];
