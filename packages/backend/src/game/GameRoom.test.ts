import { describe, it, expect, beforeEach } from 'vitest';
import { GameRoom } from './GameRoom.js';

function setupPlayingRoom(): GameRoom {
  const room = new GameRoom('TEST');
  room.addPlayer('p1', 'Alice');
  room.addPlayer('p2', 'Bob');
  room.selectTheme('food');
  room.startGame();
  return room;
}

describe('GameRoom', () => {
  let room: GameRoom;

  beforeEach(() => {
    room = new GameRoom('TEST');
  });

  describe('addPlayer', () => {
    it('プレイヤーを追加できる', () => {
      const result = room.addPlayer('p1', 'Alice');

      expect(result).toEqual({ ok: true });
      expect(room.players).toHaveLength(1);
      expect(room.players[0].name).toBe('Alice');
    });

    it('最初のプレイヤーがホストになる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');

      expect(room.players[0].isHost).toBe(true);
      expect(room.players[1].isHost).toBe(false);
    });

    it('同じ名前は追加できない', () => {
      room.addPlayer('p1', 'Alice');
      const result = room.addPlayer('p2', 'Alice');

      expect(result).toEqual({ ok: false, error: 'この名前はすでに使われています' });
    });

    it('7人目は追加できない', () => {
      for (let i = 0; i < 6; i++) {
        room.addPlayer(`p${i}`, `Player${i}`);
      }
      const result = room.addPlayer('p6', 'Player6');

      expect(result).toEqual({ ok: false, error: '最大6人までです' });
    });

    it('ゲーム中は追加できない', () => {
      const playingRoom = setupPlayingRoom();
      const result = playingRoom.addPlayer('p3', 'Charlie');

      expect(result).toEqual({ ok: false, error: 'ゲームはすでに開始されています' });
    });
  });

  describe('removePlayer', () => {
    it('プレイヤーを削除できる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');

      room.removePlayer('p1');

      expect(room.players).toHaveLength(1);
      expect(room.players[0].name).toBe('Bob');
    });

    it('ホストが抜けたら次の人がホストになる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');

      room.removePlayer('p1');

      expect(room.players[0].isHost).toBe(true);
    });
  });

  describe('selectTheme', () => {
    it('テーマを選択できる', () => {
      const result = room.selectTheme('food');

      expect(result).toEqual({ ok: true });
      expect(room.themeId).toBe('food');
    });

    it('存在しないテーマはエラー', () => {
      const result = room.selectTheme('nonexistent');

      expect(result).toEqual({ ok: false, error: 'テーマが見つかりません' });
    });
  });

  describe('startGame', () => {
    it('テーマ選択後、2人以上でゲームを開始できる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.selectTheme('food');

      const result = room.startGame();

      expect(result).toEqual({ ok: true });
      expect(room.phase).toBe('playing');
      expect(room.players[0].secretWord).not.toBe('');
      expect(room.players[1].secretWord).not.toBe('');
    });

    it('テーマ未選択ではゲームを開始できない', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');

      const result = room.startGame();

      expect(result).toEqual({ ok: false, error: 'テーマを選択してください' });
    });

    it('1人ではゲームを開始できない', () => {
      room.addPlayer('p1', 'Alice');
      room.selectTheme('food');

      const result = room.startGame();

      expect(result).toEqual({ ok: false, error: '最低2人必要です' });
    });

    it('各プレイヤーに異なるワードが割り当てられる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.addPlayer('p3', 'Charlie');
      room.selectTheme('food');
      room.startGame();

      const words = room.players.map(p => p.secretWord);
      const uniqueWords = new Set(words);

      expect(uniqueWords.size).toBe(3);
    });
  });

  describe('handleMessage', () => {
    beforeEach(() => {
      room = setupPlayingRoom();
    });

    it('通常のメッセージはマッチなしで処理される', () => {
      const result = room.handleMessage('p1', 'こんにちは');

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.match).toBeNull();
        expect(result.message.type).toBe('chat');
      }
    });

    it('自分のワードを言うと脱落する', () => {
      const myWord = room.players[0].secretWord;

      const result = room.handleMessage('p1', `今日は${myWord}を見た`);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.match).not.toBeNull();
        expect(result.match!.isSelfMatch).toBe(true);
      }
      expect(room.players[0].isEliminated).toBe(true);
      expect(room.players[0].eliminationReason).toBe('said_own_word');
    });

    it('他人のワードを言っても何も起きない', () => {
      const opponentWord = room.players[0].secretWord;

      const result = room.handleMessage('p2', `今日は${opponentWord}を見た`);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.match).toBeNull();
      }
      expect(room.players[0].isEliminated).toBe(false);
      expect(room.phase).toBe('playing');
    });

    it('自爆で残り1人になったらその人が勝ち', () => {
      const myWord = room.players[0].secretWord;

      room.handleMessage('p1', `今日は${myWord}を見た`);

      expect(room.players[0].isEliminated).toBe(true);
      expect(room.winnerId).toBe('p2');
      expect(room.phase).toBe('finished');
    });

    it('脱落したプレイヤーはメッセージを送れない', () => {
      room.players[0].isEliminated = true;

      const result = room.handleMessage('p1', 'まだいるよ');

      expect('error' in result).toBe(true);
    });
  });

  describe('getStateForPlayer', () => {
    it('自分のワードはnullになる', () => {
      const playingRoom = setupPlayingRoom();
      const state = playingRoom.getStateForPlayer('p1');

      const me = state.players.find(p => p.id === 'p1');
      const other = state.players.find(p => p.id === 'p2');

      expect(me!.secretWord).toBeNull();
      expect(other!.secretWord).not.toBeNull();
      expect(other!.secretWord).not.toBe('');
    });

    it('テーマ情報が含まれる', () => {
      const playingRoom = setupPlayingRoom();
      const state = playingRoom.getStateForPlayer('p1');

      expect(state.themeId).toBe('food');
      expect(state.themeLabel).toBe('グルメトーク');
    });
  });

  describe('restart', () => {
    it('終了後にリスタートできる', () => {
      const playingRoom = setupPlayingRoom();
      playingRoom.phase = 'finished';

      const result = playingRoom.restart();

      expect(result).toEqual({ ok: true });
      expect(playingRoom.phase).toBe('waiting');
      expect(playingRoom.players[0].secretWord).toBe('');
      expect(playingRoom.themeId).toBeUndefined();
    });

    it('ゲーム中はリスタートできない', () => {
      const playingRoom = setupPlayingRoom();

      const result = playingRoom.restart();

      expect(result).toEqual({ ok: false, error: 'ゲームが終了していません' });
    });
  });
});
