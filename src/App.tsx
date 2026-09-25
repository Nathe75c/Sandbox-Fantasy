import { useGame } from './components/GameContext';
import { MainMenu } from './components/MainMenu';
import { CharacterCreation } from './components/CharacterCreation';
import { GameScreen } from './components/GameScreen';

/**
 * Trois écrans : menu principal -> création de personnage -> jeu.
 * L'écran affiché découle uniquement de l'état du store.
 */
export default function App() {
  const { state, player } = useGame();
  if (!state) return <MainMenu />;
  if (!player) return <CharacterCreation />;
  return <GameScreen />;
}
