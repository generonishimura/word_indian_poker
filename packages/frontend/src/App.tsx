import { useState } from 'react';
import type { GameState } from '@wip/shared';
import { useSocket } from './hooks/useSocket.js';
import { LobbyPage } from './pages/LobbyPage.js';
import { GamePage } from './pages/GamePage.js';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const socket = useSocket(setGameState);

  if (!gameState) {
    return <LobbyPage socket={socket} />;
  }

  return <GamePage socket={socket} gameState={gameState} />;
}
