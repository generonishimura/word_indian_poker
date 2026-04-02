import { describe, it, expect, beforeEach } from 'vitest';
import type { RoomRecord } from '@wip/shared';
import type { RoomRepository } from './repository/types.js';
import { createResolver } from './resolver.js';

function createMockRepo(): RoomRepository & { store: Map<string, RoomRecord> } {
  const store = new Map<string, RoomRecord>();
  return {
    store,
    async getRoom(roomCode: string) {
      return store.get(roomCode) ?? null;
    },
    async saveRoom(record: RoomRecord) {
      store.set(record.roomCode, record);
    },
  };
}

function event(fieldName: string, args: Record<string, string>) {
  return {
    info: { fieldName, parentTypeName: fieldName === 'getGameState' ? 'Query' : 'Mutation' },
    arguments: args,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResult = any;

describe('resolver', () => {
  let repo: ReturnType<typeof createMockRepo>;
  let resolve: (e: ReturnType<typeof event>) => Promise<AnyResult>;

  beforeEach(() => {
    repo = createMockRepo();
    resolve = createResolver(repo) as (e: ReturnType<typeof event>) => Promise<AnyResult>;
  });

  describe('createRoom', () => {
    it('ルームを作成してroomCodeを返す', async () => {
      const result = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));

      expect(result.roomCode).toBeTruthy();
      expect(result.error).toBeUndefined();
      expect(repo.store.size).toBe(1);

      const saved = [...repo.store.values()][0];
      expect(saved.players).toHaveLength(1);
      expect(saved.players[0].name).toBe('Alice');
      expect(saved.players[0].isHost).toBe(true);
    });
  });

  describe('joinRoom', () => {
    it('既存ルームに参加できる', async () => {
      const createResult = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      const roomCode = createResult.roomCode;

      const result = await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));

      expect(result.error).toBeUndefined();
      const saved = repo.store.get(roomCode)!;
      expect(saved.players).toHaveLength(2);
    });

    it('存在しないルームはエラー', async () => {
      const result = await resolve(event('joinRoom', { roomCode: 'XXXX', playerId: 'p1', playerName: 'Alice' }));

      expect(result.error).toBe('ルームが見つかりません');
    });
  });

  describe('selectTheme', () => {
    it('ホストがテーマを選択できる', async () => {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));

      const result = await resolve(event('selectTheme', { roomCode, playerId: 'p1', themeId: 'food' }));

      expect(result.error).toBeUndefined();
      const saved = repo.store.get(roomCode)!;
      expect(saved.themeId).toBe('food');
    });

    it('ホスト以外はテーマ選択できない', async () => {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));

      const result = await resolve(event('selectTheme', { roomCode, playerId: 'p2', themeId: 'food' }));

      expect(result.error).toBe('ホストのみテーマを選択できます');
    });
  });

  describe('startGame', () => {
    it('2人以上 + テーマ選択でゲーム開始', async () => {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));
      await resolve(event('selectTheme', { roomCode, playerId: 'p1', themeId: 'food' }));

      const result = await resolve(event('startGame', { roomCode, playerId: 'p1' }));

      expect(result.error).toBeUndefined();
      const saved = repo.store.get(roomCode)!;
      expect(saved.phase).toBe('playing');
      expect(saved.players[0].secretWords.length).toBeGreaterThan(0);
    });

    it('ホスト以外はゲーム開始できない', async () => {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));
      await resolve(event('selectTheme', { roomCode, playerId: 'p1', themeId: 'food' }));

      const result = await resolve(event('startGame', { roomCode, playerId: 'p2' }));

      expect(result.error).toBe('ホストのみゲームを開始できます');
    });
  });

  describe('sendMessage', () => {
    async function setupPlayingRoom() {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));
      await resolve(event('selectTheme', { roomCode, playerId: 'p1', themeId: 'food' }));
      await resolve(event('startGame', { roomCode, playerId: 'p1' }));
      return roomCode;
    }

    it('通常メッセージを送信できる', async () => {
      const roomCode = await setupPlayingRoom();

      const result = await resolve(event('sendMessage', { roomCode, playerId: 'p1', text: 'こんにちは' }));

      expect(result.error).toBeUndefined();
      expect(result.message).toBeTruthy();
      expect(result.message.text).toBe('こんにちは');
    });

    it('自分のワードを言うと脱落情報が返る', async () => {
      const roomCode = await setupPlayingRoom();
      const saved = repo.store.get(roomCode)!;
      const myWord = saved.players[0].secretWords[0];

      const result = await resolve(event('sendMessage', { roomCode, playerId: 'p1', text: `今日は${myWord}を見た` }));

      expect(result.elimination).toBeTruthy();
      expect(result.elimination.playerId).toBe('p1');
    });

    it('最後の1人になったらgameOver情報が返る', async () => {
      const roomCode = await setupPlayingRoom();
      const saved = repo.store.get(roomCode)!;
      const myWord = saved.players[0].secretWords[0];

      const result = await resolve(event('sendMessage', { roomCode, playerId: 'p1', text: `今日は${myWord}を見た` }));

      expect(result.gameOver).toBeTruthy();
      expect(result.gameOver.winnerId).toBe('p2');
      expect(result.gameOver.winnerName).toBe('Bob');
    });
  });

  describe('restartGame', () => {
    it('終了後にリスタートできる', async () => {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));
      await resolve(event('selectTheme', { roomCode, playerId: 'p1', themeId: 'food' }));
      await resolve(event('startGame', { roomCode, playerId: 'p1' }));

      // 自爆して終了させる
      const saved = repo.store.get(roomCode)!;
      const myWord = saved.players[0].secretWords[0];
      await resolve(event('sendMessage', { roomCode, playerId: 'p1', text: myWord }));

      const result = await resolve(event('restartGame', { roomCode, playerId: 'p1' }));

      expect(result.error).toBeUndefined();
      const afterRestart = repo.store.get(roomCode)!;
      expect(afterRestart.phase).toBe('waiting');
    });
  });

  describe('getGameState', () => {
    it('プレイヤーごとの状態を返す（自分のワードはnull）', async () => {
      const { roomCode } = await resolve(event('createRoom', { playerId: 'p1', playerName: 'Alice' }));
      await resolve(event('joinRoom', { roomCode, playerId: 'p2', playerName: 'Bob' }));
      await resolve(event('selectTheme', { roomCode, playerId: 'p1', themeId: 'food' }));
      await resolve(event('startGame', { roomCode, playerId: 'p1' }));

      const result = await resolve(event('getGameState', { roomCode, playerId: 'p1' }));

      expect(result.roomCode).toBe(roomCode);
      expect(result.phase).toBe('playing');
      expect(result.currentPlayerId).toBe('p1');

      const me = result.players.find((p: { id: string }) => p.id === 'p1');
      const other = result.players.find((p: { id: string }) => p.id === 'p2');
      expect(me.secretWords).toBeNull();
      expect(other.secretWords).not.toBeNull();
    });
  });
});
