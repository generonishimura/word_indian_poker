import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents, GameState } from '@wip/shared';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket(
  onGameState: (state: GameState) => void,
): GameSocket {
  const socketRef = useRef<GameSocket | null>(null);

  if (!socketRef.current) {
    const wsUrl = import.meta.env.VITE_WS_URL;
    socketRef.current = io(wsUrl || undefined, {
      autoConnect: true,
    });
  }

  useEffect(() => {
    const socket = socketRef.current!;

    socket.on('game_state', onGameState);

    return () => {
      socket.off('game_state', onGameState);
    };
  }, [onGameState]);

  return socketRef.current;
}
