export type GamePhase = 'waiting' | 'playing' | 'finished';

export type EliminationReason = 'said_own_word' | 'tricked';

export interface Player {
  id: string;
  name: string;
  secretWord: string;
  isEliminated: boolean;
  eliminationReason?: EliminationReason;
  isHost: boolean;
}

export interface PlayerView {
  id: string;
  name: string;
  secretWord: string | null; // null = 自分自身のワード（見えない）
  isEliminated: boolean;
  eliminationReason?: EliminationReason;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  triggeredWord?: string;
}

export interface SystemMessage {
  id: string;
  text: string;
  timestamp: number;
}

export type Message = (ChatMessage & { type: 'chat' }) | (SystemMessage & { type: 'system' });

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: PlayerView[];
  messages: Message[];
  currentPlayerId: string;
  winnerId?: string;
}

export interface WordMatch {
  senderId: string;
  matchedPlayerId: string;
  matchedWord: string;
  isSelfMatch: boolean;
}

// Socket.IO Events
export interface ClientToServerEvents {
  create_room: (data: { playerName: string }, callback: (res: { roomCode: string } | { error: string }) => void) => void;
  join_room: (data: { roomCode: string; playerName: string }, callback: (res: { success: true } | { error: string }) => void) => void;
  start_game: (callback: (res: { success: true } | { error: string }) => void) => void;
  send_message: (data: { text: string }) => void;
  restart_game: (callback: (res: { success: true } | { error: string }) => void) => void;
}

export interface ServerToClientEvents {
  game_state: (state: GameState) => void;
  new_message: (message: Message) => void;
  player_eliminated: (data: { playerId: string; playerName: string; reason: EliminationReason; word: string }) => void;
  game_over: (data: { winnerId: string; winnerName: string }) => void;
  error: (data: { message: string }) => void;
}
