import { randomBytes } from 'node:crypto';
import type { Player, GamePhase, GameState, PlayerView, Message, ChatMessage, WordMatch, RoomRecord } from '@wip/shared';
import { MIN_PLAYERS, MAX_PLAYERS, ROOM_CODE_LENGTH, WORD_ADD_INTERVAL_MS, MAX_CHALLENGES } from '@wip/shared';
import { detectWord, normalizeJapanese } from '@wip/shared';
import { getThemeById } from '@wip/shared';
import { assignWords } from './WordAssigner.js';

const TTL_HOURS = 24;

export class GameRoom {
  readonly roomCode: string;
  phase: GamePhase = 'waiting';
  players: Player[] = [];
  messages: Message[] = [];
  winnerId?: string;
  themeId?: string;
  private messageCounter = 0;
  private readonly createdAt: number;

  constructor(roomCode?: string) {
    this.roomCode = roomCode ?? GameRoom.generateRoomCode();
    this.createdAt = Date.now();
  }

  toRecord(): RoomRecord {
    const now = Date.now();
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      players: this.players,
      messages: this.messages,
      winnerId: this.winnerId,
      themeId: this.themeId,
      messageCounter: this.messageCounter,
      createdAt: this.createdAt,
      updatedAt: now,
      ttl: Math.floor(now / 1000) + TTL_HOURS * 3600,
    };
  }

  static fromRecord(record: RoomRecord): GameRoom {
    const room = new GameRoom(record.roomCode);
    room.phase = record.phase;
    room.players = record.players;
    room.messages = record.messages;
    room.winnerId = record.winnerId;
    room.themeId = record.themeId;
    room.messageCounter = record.messageCounter;
    // createdAt is set in constructor, override it
    (room as unknown as { createdAt: number }).createdAt = record.createdAt;
    return room;
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

  addPlayer(id: string, name: string, avatarId?: string): { ok: true } | { ok: false; error: string } {
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
      avatarId,
      secretWords: [],
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
    const now = Date.now();
    this.players.forEach((p, i) => {
      p.secretWords = [words[i]];
      p.isEliminated = false;
      p.eliminationReason = undefined;
      p.lastWordAddedAt = now;
      p.challengesRemaining = MAX_CHALLENGES;
    });

    this.phase = 'playing';
    this.messages = [];
    this.winnerId = undefined;

    const theme = getThemeById(this.themeId);
    this.addSystemMessage(`テーマ「${theme!.label}」でゲームスタート！${theme!.description}`);
    return { ok: true };
  }

  handleMessage(senderId: string, text: string): { message: Message; match: WordMatch | null; addedWords: Array<{ playerId: string; word: string }> } | { error: string } {
    if (this.phase !== 'playing') {
      return { error: 'ゲーム中ではありません' };
    }

    const sender = this.players.find(p => p.id === senderId);
    if (!sender) return { error: 'プレイヤーが見つかりません' };
    if (sender.isEliminated) return { error: 'あなたはすでに脱落しています' };

    // メッセージ処理前にワード追加チェック
    const addedWords = this.checkAndAddWords();

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

    return { message: chatMsg, match, addedWords };
  }

  checkAndAddWords(): Array<{ playerId: string; word: string }> {
    if (this.phase !== 'playing' || !this.themeId) return [];

    const now = Date.now();
    const theme = getThemeById(this.themeId);
    if (!theme) return [];

    // 全プレイヤーの使用済みワードを収集
    const usedWords = new Set(this.players.flatMap(p => p.secretWords));

    const added: Array<{ playerId: string; word: string }> = [];

    for (const player of this.players) {
      if (player.isEliminated) continue;
      if (!player.lastWordAddedAt) continue;
      if (now - player.lastWordAddedAt < WORD_ADD_INTERVAL_MS) continue;

      // 未使用のワードから選ぶ
      const availableWords = theme.words.filter(w => !usedWords.has(w));
      if (availableWords.length === 0) continue;

      const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      player.secretWords.push(newWord);
      player.lastWordAddedAt = now;
      usedWords.add(newWord);
      added.push({ playerId: player.id, word: newWord });
    }

    if (added.length > 0) {
      const names = added.map(a => {
        const p = this.players.find(p => p.id === a.playerId);
        return p?.name;
      }).filter(Boolean).join('、');
      this.addSystemMessage(`${names} にドボンワードが追加されました！`);
    }

    return added;
  }

  handleChallenge(playerId: string, guess: string): { success: boolean; guessedWord: string; matchedWord?: string; penaltyPlayerId?: string; penaltyWord?: string } | { error: string } {
    if (this.phase !== 'playing') {
      return { error: 'ゲーム中ではありません' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: 'プレイヤーが見つかりません' };
    if (player.isEliminated) return { error: 'あなたはすでに脱落しています' };
    if ((player.challengesRemaining ?? 0) <= 0) return { error: 'チャレンジ回数が残っていません' };

    const normalizedGuess = normalizeJapanese(guess.toLowerCase());
    const matchedIndex = player.secretWords.findIndex(
      w => normalizeJapanese(w.toLowerCase()) === normalizedGuess
    );

    if (matchedIndex !== -1) {
      // チャレンジ成功 — 当てたワードを新しいワードに置き換え
      const matchedWord = player.secretWords[matchedIndex];
      const replacementWord = this.pickNewWord();
      if (replacementWord) {
        player.secretWords[matchedIndex] = replacementWord;
      } else {
        player.secretWords.splice(matchedIndex, 1);
      }

      this.addSystemMessage(`${player.name} がチャレンジ成功！ワード「${matchedWord}」を当てた！`);

      // 発言数が最も少ない生存プレイヤー（自分以外）にワードを追加
      const penaltyResult = this.addWordToLeastActivePlayer(playerId);
      if (penaltyResult) {
        this.addSystemMessage(`${penaltyResult.playerName} にドボンワードが追加されました！`);
      }

      return {
        success: true,
        guessedWord: guess,
        matchedWord,
        penaltyPlayerId: penaltyResult?.playerId,
        penaltyWord: penaltyResult?.word,
      };
    } else {
      // チャレンジ失敗 — 残数デクリメント + 自分にワード追加
      player.challengesRemaining = (player.challengesRemaining ?? 0) - 1;
      const newWord = this.pickNewWord();
      if (newWord) {
        player.secretWords.push(newWord);
        this.addSystemMessage(`${player.name} のチャレンジ失敗…ドボンワードが追加された！`);
        return { success: false, guessedWord: guess, penaltyPlayerId: player.id, penaltyWord: newWord };
      }
      this.addSystemMessage(`${player.name} のチャレンジ失敗…`);
      return { success: false, guessedWord: guess };
    }
  }

  private addWordToLeastActivePlayer(excludePlayerId: string): { playerId: string; playerName: string; word: string } | null {
    const alivePlayers = this.players.filter(p => !p.isEliminated && p.id !== excludePlayerId);
    if (alivePlayers.length === 0) return null;

    // 各プレイヤーのチャットメッセージ数をカウント
    const messageCounts = new Map<string, number>();
    for (const p of alivePlayers) {
      messageCounts.set(p.id, 0);
    }
    for (const msg of this.messages) {
      if (msg.type === 'chat' && messageCounts.has(msg.playerId)) {
        messageCounts.set(msg.playerId, (messageCounts.get(msg.playerId) ?? 0) + 1);
      }
    }

    // 発言数が最も少ないプレイヤーを選ぶ
    let minCount = Infinity;
    let target = alivePlayers[0];
    for (const p of alivePlayers) {
      const count = messageCounts.get(p.id) ?? 0;
      if (count < minCount) {
        minCount = count;
        target = p;
      }
    }

    const newWord = this.pickNewWord();
    if (!newWord) return null;

    target.secretWords.push(newWord);
    return { playerId: target.id, playerName: target.name, word: newWord };
  }

  private pickNewWord(): string | null {
    if (!this.themeId) return null;
    const theme = getThemeById(this.themeId);
    if (!theme) return null;

    const usedWords = new Set(this.players.flatMap(p => p.secretWords));
    const availableWords = theme.words.filter(w => !usedWords.has(w));
    if (availableWords.length === 0) return null;

    return availableWords[Math.floor(Math.random() * availableWords.length)];
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
      p.secretWords = [];
      p.isEliminated = false;
      p.eliminationReason = undefined;
      p.lastWordAddedAt = undefined;
      p.challengesRemaining = undefined;
    });
    return { ok: true };
  }

  getStateForPlayer(playerId: string): GameState {
    const playerViews: PlayerView[] = this.players.map(p => ({
      id: p.id,
      name: p.name,
      avatarId: p.avatarId,
      secretWords: p.id === playerId ? null : p.secretWords,
      isEliminated: p.isEliminated,
      eliminationReason: p.eliminationReason,
      isHost: p.isHost,
      challengesRemaining: p.challengesRemaining,
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
