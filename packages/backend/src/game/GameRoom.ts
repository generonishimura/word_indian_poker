import { randomBytes } from 'node:crypto';
import type { Player, GamePhase, GameState, PlayerView, Message, ChatMessage, WordMatch } from '@wip/shared';
import { MIN_PLAYERS, MAX_PLAYERS, ROOM_CODE_LENGTH } from '@wip/shared';
import { detectWord } from '@wip/shared';
import { getThemeById } from '@wip/shared';
import { assignWords } from './WordAssigner.js';

export class GameRoom {
  readonly roomCode: string;
  phase: GamePhase = 'waiting';
  players: Player[] = [];
  messages: Message[] = [];
  winnerId?: string;
  themeId?: string;
  private messageCounter = 0;

  constructor(roomCode?: string) {
    this.roomCode = roomCode ?? GameRoom.generateRoomCode();
  }

  static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字を除外
    let code = '';
    const bytes = randomBytes(ROOM_CODE_LENGTH);
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  addPlayer(id: string, name: string): { ok: true } | { ok: false; error: string } {
    if (this.phase !== 'waiting') {
      return { ok: false, error: 'ゲームはすでに開始されています' };
    }
    if (this.players.length >= MAX_PLAYERS) {
      return { ok: false, error: `最大${MAX_PLAYERS}人までです` };
    }
    if (this.players.some(p => p.name === name)) {
      return { ok: false, error: 'この名前はすでに使われています' };
    }

    const isHost = this.players.length === 0;
    this.players.push({
      id,
      name,
      secretWord: '',
      isEliminated: false,
      isHost,
    });
    return { ok: true };
  }

  removePlayer(id: string): void {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx === -1) return;

    const wasHost = this.players[idx].isHost;
    this.players.splice(idx, 1);

    // ホストが抜けたら次の人をホストに
    if (wasHost && this.players.length > 0) {
      this.players[0].isHost = true;
    }
  }

  selectTheme(themeId: string): { ok: true } | { ok: false; error: string } {
    if (this.phase !== 'waiting') {
      return { ok: false, error: 'ゲームはすでに開始されています' };
    }
    const theme = getThemeById(themeId);
    if (!theme) {
      return { ok: false, error: 'テーマが見つかりません' };
    }
    this.themeId = themeId;
    return { ok: true };
  }

  startGame(): { ok: true } | { ok: false; error: string } {
    if (this.players.length < MIN_PLAYERS) {
      return { ok: false, error: `最低${MIN_PLAYERS}人必要です` };
    }
    if (this.phase !== 'waiting') {
      return { ok: false, error: 'ゲームはすでに開始されています' };
    }
    if (!this.themeId) {
      return { ok: false, error: 'テーマを選択してください' };
    }

    const words = assignWords(this.players.length, this.themeId);
    this.players.forEach((p, i) => {
      p.secretWord = words[i];
      p.isEliminated = false;
      p.eliminationReason = undefined;
    });

    this.phase = 'playing';
    this.messages = [];
    this.winnerId = undefined;

    const theme = getThemeById(this.themeId);
    this.addSystemMessage(`テーマ「${theme!.label}」でゲームスタート！${theme!.description}`);
    return { ok: true };
  }

  handleMessage(senderId: string, text: string): { message: Message; match: WordMatch | null } | { error: string } {
    if (this.phase !== 'playing') {
      return { error: 'ゲーム中ではありません' };
    }

    const sender = this.players.find(p => p.id === senderId);
    if (!sender) return { error: 'プレイヤーが見つかりません' };
    if (sender.isEliminated) return { error: 'あなたはすでに脱落しています' };

    const match = detectWord(text, senderId, this.players);

    const chatMsg: ChatMessage & { type: 'chat' } = {
      type: 'chat',
      id: this.nextMessageId(),
      playerId: senderId,
      playerName: sender.name,
      text,
      timestamp: Date.now(),
      triggeredWord: match?.matchedWord,
    };
    this.messages.push(chatMsg);

    if (match) {
      this.applyMatch(match);
    }

    return { message: chatMsg, match };
  }

  private applyMatch(match: WordMatch): void {
    const matchedPlayer = this.players.find(p => p.id === match.matchedPlayerId);
    if (!matchedPlayer) return;

    // 自爆: 自分のワードを言ってしまった
    matchedPlayer.isEliminated = true;
    matchedPlayer.eliminationReason = 'said_own_word';
    this.addSystemMessage(`${matchedPlayer.name} が自分のワード「${match.matchedWord}」を言ってしまった！脱落！`);

    // 残りプレイヤーが1人なら勝ち
    const alivePlayers = this.players.filter(p => !p.isEliminated);
    if (alivePlayers.length <= 1) {
      if (alivePlayers.length === 1) {
        this.winnerId = alivePlayers[0].id;
        this.addSystemMessage(`${alivePlayers[0].name} の勝ち！`);
      }
      this.phase = 'finished';
    }
  }

  restart(): { ok: true } | { ok: false; error: string } {
    if (this.phase !== 'finished') {
      return { ok: false, error: 'ゲームが終了していません' };
    }
    this.phase = 'waiting';
    this.messages = [];
    this.winnerId = undefined;
    this.themeId = undefined;
    this.players.forEach(p => {
      p.secretWord = '';
      p.isEliminated = false;
      p.eliminationReason = undefined;
    });
    return { ok: true };
  }

  getStateForPlayer(playerId: string): GameState {
    const playerViews: PlayerView[] = this.players.map(p => ({
      id: p.id,
      name: p.name,
      secretWord: p.id === playerId ? null : p.secretWord,
      isEliminated: p.isEliminated,
      eliminationReason: p.eliminationReason,
      isHost: p.isHost,
    }));

    const theme = this.themeId ? getThemeById(this.themeId) : undefined;

    return {
      roomCode: this.roomCode,
      phase: this.phase,
      players: playerViews,
      messages: this.messages,
      currentPlayerId: playerId,
      winnerId: this.winnerId,
      themeId: this.themeId,
      themeLabel: theme?.label,
    };
  }

  private addSystemMessage(text: string): void {
    this.messages.push({
      type: 'system',
      id: this.nextMessageId(),
      text,
      timestamp: Date.now(),
    });
  }

  private nextMessageId(): string {
    return `msg-${++this.messageCounter}`;
  }
}

// ルーム管理
const rooms = new Map<string, GameRoom>();
const playerRoomMap = new Map<string, string>(); // socketId -> roomCode

export function getRoom(roomCode: string): GameRoom | undefined {
  return rooms.get(roomCode);
}

export function createRoom(): GameRoom {
  const room = new GameRoom();
  rooms.set(room.roomCode, room);
  return room;
}

export function setPlayerRoom(socketId: string, roomCode: string): void {
  playerRoomMap.set(socketId, roomCode);
}

export function getPlayerRoom(socketId: string): string | undefined {
  return playerRoomMap.get(socketId);
}

export function removePlayerFromRoom(socketId: string): void {
  const roomCode = playerRoomMap.get(socketId);
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (room) {
    room.removePlayer(socketId);
    if (room.players.length === 0) {
      rooms.delete(roomCode);
    }
  }
  playerRoomMap.delete(socketId);
}
