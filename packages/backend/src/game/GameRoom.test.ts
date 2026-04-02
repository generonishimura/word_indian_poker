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
      expect(room.players[0].secretWords.length).toBeGreaterThan(0);
      expect(room.players[1].secretWords.length).toBeGreaterThan(0);
    });

    it('ゲーム開始時にlastWordAddedAtが設定される', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.selectTheme('food');
      const before = Date.now();

      room.startGame();

      room.players.forEach(p => {
        expect(p.lastWordAddedAt).toBeGreaterThanOrEqual(before);
      });
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

      const words = room.players.map(p => p.secretWords[0]);
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
      const myWord = room.players[0].secretWords[0];

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
      const opponentWord = room.players[0].secretWords[0];

      const result = room.handleMessage('p2', `今日は${opponentWord}を見た`);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.match).toBeNull();
      }
      expect(room.players[0].isEliminated).toBe(false);
      expect(room.phase).toBe('playing');
    });

    it('自爆で残り1人になったらその人が勝ち', () => {
      const myWord = room.players[0].secretWords[0];

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

      expect(me!.secretWords).toBeNull();
      expect(other!.secretWords).not.toBeNull();
      expect(other!.secretWords!.length).toBeGreaterThan(0);
    });

    it('テーマ情報が含まれる', () => {
      const playingRoom = setupPlayingRoom();
      const state = playingRoom.getStateForPlayer('p1');

      expect(state.themeId).toBe('food');
      expect(state.themeLabel).toBe('グルメトーク');
    });
  });

  describe('checkAndAddWords', () => {
    it('2分経過したプレイヤーにワードが追加される', () => {
      const playingRoom = setupPlayingRoom();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000 - 1;
      playingRoom.players.forEach(p => { p.lastWordAddedAt = twoMinutesAgo; });

      const added = playingRoom.checkAndAddWords();

      expect(added.length).toBeGreaterThan(0);
      const p1 = playingRoom.players.find(p => p.id === 'p1')!;
      expect(p1.secretWords.length).toBe(2);
    });

    it('2分経過していないプレイヤーにはワードが追加されない', () => {
      const playingRoom = setupPlayingRoom();
      // lastWordAddedAt is set to now by startGame

      const added = playingRoom.checkAndAddWords();

      expect(added).toHaveLength(0);
      const p1 = playingRoom.players.find(p => p.id === 'p1')!;
      expect(p1.secretWords.length).toBe(1);
    });

    it('脱落済みプレイヤーにはワードが追加されない', () => {
      const playingRoom = setupPlayingRoom();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000 - 1;
      playingRoom.players.forEach(p => { p.lastWordAddedAt = twoMinutesAgo; });
      playingRoom.players[0].isEliminated = true;

      const added = playingRoom.checkAndAddWords();

      const p1 = playingRoom.players.find(p => p.id === 'p1')!;
      expect(p1.secretWords.length).toBe(1); // 追加されない
      const p2 = playingRoom.players.find(p => p.id === 'p2')!;
      expect(p2.secretWords.length).toBe(2); // 追加される
    });

    it('追加されたワードは既存のワードと重複しない', () => {
      const playingRoom = setupPlayingRoom();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000 - 1;
      playingRoom.players.forEach(p => { p.lastWordAddedAt = twoMinutesAgo; });

      playingRoom.checkAndAddWords();

      const allWords = playingRoom.players.flatMap(p => p.secretWords);
      const uniqueWords = new Set(allWords);
      expect(uniqueWords.size).toBe(allWords.length);
    });

    it('ワード追加時にシステムメッセージが追加される', () => {
      const playingRoom = setupPlayingRoom();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000 - 1;
      playingRoom.players.forEach(p => { p.lastWordAddedAt = twoMinutesAgo; });
      const msgCountBefore = playingRoom.messages.length;

      playingRoom.checkAndAddWords();

      expect(playingRoom.messages.length).toBeGreaterThan(msgCountBefore);
      const lastMsg = playingRoom.messages[playingRoom.messages.length - 1];
      expect(lastMsg.type).toBe('system');
    });

    it('ワード追加後lastWordAddedAtが更新される', () => {
      const playingRoom = setupPlayingRoom();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000 - 1;
      playingRoom.players.forEach(p => { p.lastWordAddedAt = twoMinutesAgo; });

      playingRoom.checkAndAddWords();

      playingRoom.players.forEach(p => {
        if (!p.isEliminated) {
          expect(p.lastWordAddedAt).toBeGreaterThan(twoMinutesAgo);
        }
      });
    });

    it('ゲーム中でなければワードは追加されない', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');

      const added = room.checkAndAddWords();

      expect(added).toHaveLength(0);
    });
  });

  describe('handleMessage with word addition', () => {
    it('メッセージ送信時に2分経過チェックが行われる', () => {
      const playingRoom = setupPlayingRoom();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000 - 1;
      playingRoom.players.forEach(p => { p.lastWordAddedAt = twoMinutesAgo; });

      playingRoom.handleMessage('p1', 'こんにちは');

      // 2分経過しているので全生存プレイヤーにワード追加されている
      playingRoom.players.forEach(p => {
        if (!p.isEliminated) {
          expect(p.secretWords.length).toBe(2);
        }
      });
    });
  });

  describe('handleChallenge', () => {
    it('正しいワードでチャレンジ成功', () => {
      const playingRoom = setupPlayingRoom();
      const myWord = playingRoom.players[0].secretWords[0];

      const result = playingRoom.handleChallenge('p1', myWord);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.success).toBe(true);
        expect(result.guessedWord).toBe(myWord);
      }
    });

    it('チャレンジ成功時、発言数が少ないプレイヤーにワードが追加される', () => {
      const playingRoom = setupPlayingRoom();
      // p1が3回発言、p2が1回発言 → p2が最少
      playingRoom.handleMessage('p1', 'ひとこと');
      playingRoom.handleMessage('p1', 'ふたこと');
      playingRoom.handleMessage('p1', 'みこと');
      playingRoom.handleMessage('p2', 'ひとこと');
      const myWord = playingRoom.players[0].secretWords[0];
      const p2WordsBefore = playingRoom.players[1].secretWords.length;

      playingRoom.handleChallenge('p1', myWord);

      expect(playingRoom.players[1].secretWords.length).toBe(p2WordsBefore + 1);
    });

    it('チャレンジ成功時、当てたワードはsecretWordsから削除される', () => {
      const playingRoom = setupPlayingRoom();
      const myWord = playingRoom.players[0].secretWords[0];

      playingRoom.handleChallenge('p1', myWord);

      expect(playingRoom.players[0].secretWords).not.toContain(myWord);
    });

    it('チャレンジ成功で全ワードがなくなったら勝利', () => {
      const playingRoom = setupPlayingRoom();
      const myWord = playingRoom.players[0].secretWords[0];

      playingRoom.handleChallenge('p1', myWord);

      // secretWordsが空 → 勝利
      expect(playingRoom.winnerId).toBe('p1');
      expect(playingRoom.phase).toBe('finished');
    });

    it('間違ったワードでチャレンジ失敗', () => {
      const playingRoom = setupPlayingRoom();

      const result = playingRoom.handleChallenge('p1', 'でたらめ');

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.success).toBe(false);
      }
    });

    it('チャレンジ失敗時、自分にワードが追加される', () => {
      const playingRoom = setupPlayingRoom();
      const wordsBefore = playingRoom.players[0].secretWords.length;

      playingRoom.handleChallenge('p1', 'でたらめ');

      expect(playingRoom.players[0].secretWords.length).toBe(wordsBefore + 1);
    });

    it('カタカナ表記ゆれでもチャレンジ成功する', () => {
      const playingRoom = setupPlayingRoom();
      // food テーマなので「ラーメン」「すし」等。ひらがな・カタカナ変換でマッチするか確認
      const myWord = playingRoom.players[0].secretWords[0];
      // normalizeJapaneseでカタカナ→ひらがな変換される想定
      const katakanaGuess = myWord.replace(/[\u3041-\u3096]/g, (ch: string) =>
        String.fromCharCode(ch.charCodeAt(0) + 0x60)
      );

      const result = playingRoom.handleChallenge('p1', katakanaGuess);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.success).toBe(true);
      }
    });

    it('ゲーム中でなければチャレンジできない', () => {
      room.addPlayer('p1', 'Alice');

      const result = room.handleChallenge('p1', 'なにか');

      expect('error' in result).toBe(true);
    });

    it('脱落済みプレイヤーはチャレンジできない', () => {
      const playingRoom = setupPlayingRoom();
      playingRoom.players[0].isEliminated = true;

      const result = playingRoom.handleChallenge('p1', 'なにか');

      expect('error' in result).toBe(true);
    });

    it('チャレンジ成功時、システムメッセージが追加される', () => {
      const playingRoom = setupPlayingRoom();
      const myWord = playingRoom.players[0].secretWords[0];
      const msgCountBefore = playingRoom.messages.length;

      playingRoom.handleChallenge('p1', myWord);

      expect(playingRoom.messages.length).toBeGreaterThan(msgCountBefore);
    });

    it('チャレンジ失敗時、システムメッセージが追加される', () => {
      const playingRoom = setupPlayingRoom();
      const msgCountBefore = playingRoom.messages.length;

      playingRoom.handleChallenge('p1', 'でたらめ');

      expect(playingRoom.messages.length).toBeGreaterThan(msgCountBefore);
    });

    it('ゲーム開始時にチャレンジ残数が5に設定される', () => {
      const playingRoom = setupPlayingRoom();

      expect(playingRoom.players[0].challengesRemaining).toBe(5);
      expect(playingRoom.players[1].challengesRemaining).toBe(5);
    });

    it('チャレンジ成功時、残数は減らない', () => {
      const playingRoom = setupPlayingRoom();
      const myWord = playingRoom.players[0].secretWords[0];

      playingRoom.handleChallenge('p1', myWord);

      expect(playingRoom.players[0].challengesRemaining).toBe(5);
    });

    it('チャレンジ失敗時、残数が1減る', () => {
      const playingRoom = setupPlayingRoom();

      playingRoom.handleChallenge('p1', 'でたらめ');

      expect(playingRoom.players[0].challengesRemaining).toBe(4);
    });

    it('チャレンジ残数0ではチャレンジできない', () => {
      const playingRoom = setupPlayingRoom();
      playingRoom.players[0].challengesRemaining = 0;

      const result = playingRoom.handleChallenge('p1', 'なにか');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toBe('チャレンジ回数が残っていません');
      }
    });

    it('5回失敗したらチャレンジできなくなる', () => {
      const playingRoom = setupPlayingRoom();
      for (let i = 0; i < 5; i++) {
        playingRoom.handleChallenge('p1', 'でたらめ');
      }

      expect(playingRoom.players[0].challengesRemaining).toBe(0);
      const result = playingRoom.handleChallenge('p1', 'でたらめ');
      expect('error' in result).toBe(true);
    });

    it('発言数が同数の場合、自分以外の誰かにワードが追加される', () => {
      const playingRoom = setupPlayingRoom();
      // 発言なし = 両者0回。成功時は自分以外に追加
      const myWord = playingRoom.players[0].secretWords[0];

      playingRoom.handleChallenge('p1', myWord);

      // p1は当てたワードが消え、p2にワードが追加されているはず
      expect(playingRoom.players[1].secretWords.length).toBe(2);
    });
  });

  describe('restart', () => {
    it('終了後にリスタートできる', () => {
      const playingRoom = setupPlayingRoom();
      playingRoom.phase = 'finished';

      const result = playingRoom.restart();

      expect(result).toEqual({ ok: true });
      expect(playingRoom.phase).toBe('waiting');
      expect(playingRoom.players[0].secretWords).toEqual([]);
      expect(playingRoom.players[0].challengesRemaining).toBeUndefined();
      expect(playingRoom.themeId).toBeUndefined();
    });

    it('ゲーム中はリスタートできない', () => {
      const playingRoom = setupPlayingRoom();

      const result = playingRoom.restart();

      expect(result).toEqual({ ok: false, error: 'ゲームが終了していません' });
    });
  });

  describe('toRecord / fromRecord', () => {
    it('toRecordでRoomRecordに変換できる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.selectTheme('food');

      const record = room.toRecord();

      expect(record.roomCode).toBe('TEST');
      expect(record.phase).toBe('waiting');
      expect(record.players).toHaveLength(2);
      expect(record.themeId).toBe('food');
      expect(record.messageCounter).toBe(0);
      expect(record.createdAt).toBeGreaterThan(0);
      expect(record.updatedAt).toBeGreaterThan(0);
      // TTLは秒単位、createdAtはミリ秒単位
      expect(record.ttl).toBeGreaterThan(Math.floor(record.createdAt / 1000));
    });

    it('fromRecordでGameRoomを復元できる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.selectTheme('food');
      room.startGame();
      room.handleMessage('p1', 'こんにちは');

      const record = room.toRecord();
      const restored = GameRoom.fromRecord(record);

      expect(restored.roomCode).toBe('TEST');
      expect(restored.phase).toBe('playing');
      expect(restored.players).toHaveLength(2);
      expect(restored.players[0].name).toBe('Alice');
      expect(restored.players[0].secretWords).toEqual(room.players[0].secretWords);
      expect(restored.themeId).toBe('food');
      expect(restored.messages).toHaveLength(room.messages.length);
    });

    it('復元したGameRoomで操作を続行できる', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.selectTheme('food');
      room.startGame();

      const record = room.toRecord();
      const restored = GameRoom.fromRecord(record);

      // メッセージ送信が正常に動作する
      const result = restored.handleMessage('p1', 'こんにちは');
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        // startGameのシステムメッセージ(msg-1)の後なので msg-2
        expect(result.message.id).toBe(`msg-${record.messageCounter + 1}`);
      }
    });

    it('復元したGameRoomのメッセージカウンターが継続する', () => {
      room.addPlayer('p1', 'Alice');
      room.addPlayer('p2', 'Bob');
      room.selectTheme('food');
      room.startGame();
      room.handleMessage('p1', 'ひとこと目');

      const record = room.toRecord();
      const restored = GameRoom.fromRecord(record);

      const result = restored.handleMessage('p2', 'ふたこと目');
      if (!('error' in result)) {
        // startGameのシステムメッセージ(msg-1) + ひとこと目(msg-2) の後なのでmsg-3
        expect(result.message.id).toBe(`msg-${record.messageCounter + 1}`);
      }
    });
  });
});
