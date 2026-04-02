import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '@wip/shared';
import { graphql } from '../lib/appsync-client.js';
import {
  GET_GAME_STATE,
  CREATE_ROOM,
  JOIN_ROOM,
  SELECT_THEME,
  START_GAME,
  SEND_MESSAGE,
  CHALLENGE,
  RESTART_GAME,
} from '../lib/queries.js';

const POLL_INTERVAL_MS = 1500;

function getPlayerId(): string {
  let id = localStorage.getItem('wip-player-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('wip-player-id', id);
  }
  return id;
}

export function useGameApi() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState('');
  const playerId = useRef(getPlayerId()).current;
  const roomCodeRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGameState = useCallback(async () => {
    if (!roomCodeRef.current) return;
    try {
      const data = await graphql<{ getGameState: GameState }>(GET_GAME_STATE, {
        roomCode: roomCodeRef.current,
        playerId,
      });
      setGameState(data.getGameState);
    } catch {
      // ルームが消えた場合はポーリング停止
    }
  }, [playerId]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(fetchGameState, POLL_INTERVAL_MS);
  }, [fetchGameState]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  const createRoom = useCallback(async (playerName: string, avatarId?: string) => {
    setError('');
    const data = await graphql<{ createRoom: { roomCode: string; error?: string } }>(CREATE_ROOM, {
      playerId,
      playerName,
      avatarId,
    });
    if (data.createRoom.error) {
      setError(data.createRoom.error);
      return;
    }
    roomCodeRef.current = data.createRoom.roomCode;
    await fetchGameState();
    startPolling();
  }, [playerId, fetchGameState, startPolling]);

  const joinRoom = useCallback(async (roomCode: string, playerName: string, avatarId?: string) => {
    setError('');
    const data = await graphql<{ joinRoom: { roomCode: string; error?: string } }>(JOIN_ROOM, {
      roomCode: roomCode.toUpperCase(),
      playerId,
      playerName,
      avatarId,
    });
    if (data.joinRoom.error) {
      setError(data.joinRoom.error);
      return;
    }
    roomCodeRef.current = roomCode.toUpperCase();
    await fetchGameState();
    startPolling();
  }, [playerId, fetchGameState, startPolling]);

  const selectTheme = useCallback(async (themeId: string) => {
    if (!roomCodeRef.current) return;
    const data = await graphql<{ selectTheme: { error?: string } }>(SELECT_THEME, {
      roomCode: roomCodeRef.current,
      playerId,
      themeId,
    });
    if (data.selectTheme.error) {
      alert(data.selectTheme.error);
      return;
    }
    await fetchGameState();
  }, [playerId, fetchGameState]);

  const startGame = useCallback(async () => {
    if (!roomCodeRef.current) return;
    const data = await graphql<{ startGame: { error?: string } }>(START_GAME, {
      roomCode: roomCodeRef.current,
      playerId,
    });
    if (data.startGame.error) {
      alert(data.startGame.error);
      return;
    }
    await fetchGameState();
  }, [playerId, fetchGameState]);

  const sendMessage = useCallback(async (text: string) => {
    if (!roomCodeRef.current) return;
    const data = await graphql<{ sendMessage: { error?: string } }>(SEND_MESSAGE, {
      roomCode: roomCodeRef.current,
      playerId,
      text,
    });
    if (data.sendMessage.error) return;
    await fetchGameState();
  }, [playerId, fetchGameState]);

  const challenge = useCallback(async (guess: string): Promise<{ success: boolean } | null> => {
    if (!roomCodeRef.current) return null;
    const data = await graphql<{ challenge: { error?: string; challenge?: { success: boolean } } }>(CHALLENGE, {
      roomCode: roomCodeRef.current,
      playerId,
      guess,
    });
    if (data.challenge.error) {
      alert(data.challenge.error);
      return null;
    }
    await fetchGameState();
    return data.challenge.challenge ?? null;
  }, [playerId, fetchGameState]);

  const restartGame = useCallback(async () => {
    if (!roomCodeRef.current) return;
    const data = await graphql<{ restartGame: { error?: string } }>(RESTART_GAME, {
      roomCode: roomCodeRef.current,
      playerId,
    });
    if (data.restartGame.error) {
      alert(data.restartGame.error);
      return;
    }
    await fetchGameState();
  }, [playerId, fetchGameState]);

  return {
    gameState,
    error,
    playerId,
    createRoom,
    joinRoom,
    selectTheme,
    startGame,
    sendMessage,
    challenge,
    restartGame,
  };
}
