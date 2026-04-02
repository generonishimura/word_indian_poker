export type GamePhase = 'waiting' | 'playing' | 'finished';

export type EliminationReason = 'said_own_word';

export interface ChallengeResult {
  success: boolean;
  guessedWord: string;
  matchedWord?: string;
  penaltyPlayerId?: string;
  penaltyWord?: string;
}

export interface Player {
  id: string;
  name: string;
  avatarId?: string;
  secretWords: string[];
  isEliminated: boolean;
  eliminationReason?: EliminationReason;
  isHost: boolean;
  lastWordAddedAt?: number;
  challengesRemaining?: number;
}

export interface PlayerView {
  id: string;
  name: string;
  avatarId?: string;
  secretWords: string[] | null; // null = 自分自身のワード（見えない）
  isEliminated: boolean;
  eliminationReason?: EliminationReason;
  isHost: boolean;
  challengesRemaining?: number;
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
  themeId?: string;
  themeLabel?: string;
}

export interface WordMatch {
  senderId: string;
  matchedPlayerId: string;
  matchedWord: string;
  isSelfMatch: boolean;
}

// DynamoDB に保存するルームデータ
export interface RoomRecord {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  messages: Message[];
  winnerId?: string;
  themeId?: string;
  messageCounter: number;
  createdAt: number;
  updatedAt: number;
  ttl: number; // DynamoDB TTL (24時間後に自動削除)
}
