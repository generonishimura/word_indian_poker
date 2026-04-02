import { useGameApi } from './hooks/useGameApi.js';
import { LobbyPage } from './pages/LobbyPage.js';
import { GamePage } from './pages/GamePage.js';

export default function App() {
  const api = useGameApi();

  if (!api.gameState) {
    return <LobbyPage api={api} />;
  }

  return <GamePage api={api} />;
}
