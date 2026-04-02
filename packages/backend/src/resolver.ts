import { GameRoom } from './game/GameRoom.js';
import type { RoomRepository } from './repository/types.js';

interface AppSyncEvent {
  info: { fieldName: string; parentTypeName: string };
  arguments: Record<string, string>;
}

function roomEvent(roomCode: string, eventType: string) {
  return { roomCode, eventType, timestamp: Date.now() };
}

export function createResolver(repo: RoomRepository) {
  return async (event: AppSyncEvent) => {
    const { fieldName } = event.info;
    const args = event.arguments;

    switch (fieldName) {
      case 'createRoom':
        return handleCreateRoom(repo, args.playerId, args.playerName, args.avatarId);
      case 'joinRoom':
        return handleJoinRoom(repo, args.roomCode, args.playerId, args.playerName, args.avatarId);
      case 'selectTheme':
        return handleSelectTheme(repo, args.roomCode, args.playerId, args.themeId);
      case 'startGame':
        return handleStartGame(repo, args.roomCode, args.playerId);
      case 'sendMessage':
        return handleSendMessage(repo, args.roomCode, args.playerId, args.text);
      case 'challenge':
        return handleChallenge(repo, args.roomCode, args.playerId, args.guess);
      case 'restartGame':
        return handleRestartGame(repo, args.roomCode, args.playerId);
      case 'getGameState':
        return handleGetGameState(repo, args.roomCode, args.playerId);
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  };
}

async function loadRoom(repo: RoomRepository, roomCode: string): Promise<GameRoom | null> {
  const record = await repo.getRoom(roomCode);
  if (!record) return null;
  return GameRoom.fromRecord(record);
}

async function saveRoom(repo: RoomRepository, room: GameRoom): Promise<void> {
  await repo.saveRoom(room.toRecord());
}

function requireHost(room: GameRoom, playerId: string): string | null {
  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) return 'ホストのみ';
  return null;
}

async function handleCreateRoom(repo: RoomRepository, playerId: string, playerName: string, avatarId?: string) {
  const room = new GameRoom();
  const result = room.addPlayer(playerId, playerName, avatarId);
  if (!result.ok) {
    return { ...roomEvent(room.roomCode, 'createRoom'), error: result.error };
  }
  await saveRoom(repo, room);
  return { ...roomEvent(room.roomCode, 'createRoom') };
}

async function handleJoinRoom(repo: RoomRepository, roomCode: string, playerId: string, playerName: string, avatarId?: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    return { ...roomEvent(roomCode, 'joinRoom'), error: 'ルームが見つかりません' };
  }
  const result = room.addPlayer(playerId, playerName, avatarId);
  if (!result.ok) {
    return { ...roomEvent(roomCode, 'joinRoom'), error: result.error };
  }
  await saveRoom(repo, room);
  return { ...roomEvent(roomCode, 'joinRoom') };
}

async function handleSelectTheme(repo: RoomRepository, roomCode: string, playerId: string, themeId: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    return { ...roomEvent(roomCode, 'selectTheme'), error: 'ルームが見つかりません' };
  }
  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return { ...roomEvent(roomCode, 'selectTheme'), error: 'ホストのみテーマを選択できます' };
  }
  const result = room.selectTheme(themeId);
  if (!result.ok) {
    return { ...roomEvent(roomCode, 'selectTheme'), error: result.error };
  }
  await saveRoom(repo, room);
  return { ...roomEvent(roomCode, 'selectTheme') };
}

async function handleStartGame(repo: RoomRepository, roomCode: string, playerId: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    return { ...roomEvent(roomCode, 'startGame'), error: 'ルームが見つかりません' };
  }
  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return { ...roomEvent(roomCode, 'startGame'), error: 'ホストのみゲームを開始できます' };
  }
  const result = room.startGame();
  if (!result.ok) {
    return { ...roomEvent(roomCode, 'startGame'), error: result.error };
  }
  await saveRoom(repo, room);
  return { ...roomEvent(roomCode, 'startGame') };
}

async function handleSendMessage(repo: RoomRepository, roomCode: string, playerId: string, text: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    return { ...roomEvent(roomCode, 'sendMessage'), error: 'ルームが見つかりません' };
  }
  const result = room.handleMessage(playerId, text);
  if ('error' in result) {
    return { ...roomEvent(roomCode, 'sendMessage'), error: result.error };
  }

  const response: Record<string, unknown> = {
    ...roomEvent(roomCode, 'sendMessage'),
    message: result.message,
  };

  if (result.match) {
    const matchedPlayer = room.players.find(p => p.id === result.match!.matchedPlayerId);
    if (matchedPlayer) {
      response.elimination = {
        playerId: matchedPlayer.id,
        playerName: matchedPlayer.name,
        reason: matchedPlayer.eliminationReason!,
        word: result.match.matchedWord,
      };
    }

    if (room.phase === 'finished' && room.winnerId) {
      const winner = room.players.find(p => p.id === room.winnerId);
      if (winner) {
        response.gameOver = {
          winnerId: winner.id,
          winnerName: winner.name,
        };
      }
    }
  }

  await saveRoom(repo, room);
  return response;
}

async function handleChallenge(repo: RoomRepository, roomCode: string, playerId: string, guess: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    return { ...roomEvent(roomCode, 'challenge'), error: 'ルームが見つかりません' };
  }
  const result = room.handleChallenge(playerId, guess);
  if ('error' in result) {
    return { ...roomEvent(roomCode, 'challenge'), error: result.error };
  }

  const response: Record<string, unknown> = {
    ...roomEvent(roomCode, 'challenge'),
    challenge: {
      success: result.success,
      guessedWord: result.guessedWord,
      matchedWord: result.matchedWord,
      penaltyPlayerId: result.penaltyPlayerId,
      penaltyWord: result.penaltyWord,
    },
  };

  if (room.phase === 'finished' && room.winnerId) {
    const winner = room.players.find(p => p.id === room.winnerId);
    if (winner) {
      response.gameOver = {
        winnerId: winner.id,
        winnerName: winner.name,
      };
    }
  }

  await saveRoom(repo, room);
  return response;
}

async function handleRestartGame(repo: RoomRepository, roomCode: string, playerId: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    return { ...roomEvent(roomCode, 'restartGame'), error: 'ルームが見つかりません' };
  }
  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return { ...roomEvent(roomCode, 'restartGame'), error: 'ホストのみ再スタートできます' };
  }
  const result = room.restart();
  if (!result.ok) {
    return { ...roomEvent(roomCode, 'restartGame'), error: result.error };
  }
  await saveRoom(repo, room);
  return { ...roomEvent(roomCode, 'restartGame') };
}

async function handleGetGameState(repo: RoomRepository, roomCode: string, playerId: string) {
  const room = await loadRoom(repo, roomCode);
  if (!room) {
    throw new Error('ルームが見つかりません');
  }
  return room.getStateForPlayer(playerId);
}
