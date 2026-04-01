import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@wip/shared';
import {
  createRoom,
  getRoom,
  setPlayerRoom,
  getPlayerRoom,
  removePlayerFromRoom,
} from '../game/GameRoom.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type ClientSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

function broadcastGameState(io: IO, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room) return;

  for (const player of room.players) {
    io.to(player.id).emit('game_state', room.getStateForPlayer(player.id));
  }
}

export function registerHandlers(io: IO, socket: ClientSocket): void {
  socket.on('create_room', ({ playerName }, callback) => {
    const room = createRoom();
    const result = room.addPlayer(socket.id, playerName);
    if (!result.ok) {
      callback({ error: result.error });
      return;
    }
    socket.join(room.roomCode);
    setPlayerRoom(socket.id, room.roomCode);
    callback({ roomCode: room.roomCode });
    broadcastGameState(io, room.roomCode);
  });

  socket.on('join_room', ({ roomCode, playerName }, callback) => {
    const room = getRoom(roomCode.toUpperCase());
    if (!room) {
      callback({ error: 'ルームが見つかりません' });
      return;
    }
    const result = room.addPlayer(socket.id, playerName);
    if (!result.ok) {
      callback({ error: result.error });
      return;
    }
    socket.join(room.roomCode);
    setPlayerRoom(socket.id, room.roomCode);
    callback({ success: true });
    broadcastGameState(io, room.roomCode);
  });

  socket.on('start_game', (callback) => {
    const roomCode = getPlayerRoom(socket.id);
    if (!roomCode) {
      callback({ error: 'ルームに参加していません' });
      return;
    }
    const room = getRoom(roomCode);
    if (!room) {
      callback({ error: 'ルームが見つかりません' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) {
      callback({ error: 'ホストのみゲームを開始できます' });
      return;
    }

    const result = room.startGame();
    if (!result.ok) {
      callback({ error: result.error });
      return;
    }

    callback({ success: true });
    broadcastGameState(io, roomCode);
  });

  socket.on('send_message', ({ text }) => {
    const roomCode = getPlayerRoom(socket.id);
    if (!roomCode) return;
    const room = getRoom(roomCode);
    if (!room) return;

    const result = room.handleMessage(socket.id, text);
    if ('error' in result) return;

    // メッセージを全員にブロードキャスト
    io.to(roomCode).emit('new_message', result.message);

    if (result.match) {
      const matchedPlayer = room.players.find(p => p.id === result.match!.matchedPlayerId);
      if (matchedPlayer) {
        io.to(roomCode).emit('player_eliminated', {
          playerId: matchedPlayer.id,
          playerName: matchedPlayer.name,
          reason: matchedPlayer.eliminationReason!,
          word: result.match.matchedWord,
        });
      }

      if (room.phase === 'finished' && room.winnerId) {
        const winner = room.players.find(p => p.id === room.winnerId);
        if (winner) {
          io.to(roomCode).emit('game_over', {
            winnerId: winner.id,
            winnerName: winner.name,
          });
        }
      }

      // ゲーム状態更新を全員に送信
      broadcastGameState(io, roomCode);
    }
  });

  socket.on('restart_game', (callback) => {
    const roomCode = getPlayerRoom(socket.id);
    if (!roomCode) {
      callback({ error: 'ルームに参加していません' });
      return;
    }
    const room = getRoom(roomCode);
    if (!room) {
      callback({ error: 'ルームが見つかりません' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) {
      callback({ error: 'ホストのみ再スタートできます' });
      return;
    }

    const result = room.restart();
    if (!result.ok) {
      callback({ error: result.error });
      return;
    }

    callback({ success: true });
    broadcastGameState(io, roomCode);
  });

  socket.on('disconnect', () => {
    const roomCode = getPlayerRoom(socket.id);
    removePlayerFromRoom(socket.id);
    if (roomCode) {
      broadcastGameState(io, roomCode);
    }
    console.log(`Disconnected: ${socket.id}`);
  });
}
