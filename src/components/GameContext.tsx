import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { createGameStore, type GameStore } from '@/game/store';
import { LocalStorageAdapter } from '@/game/save/storage';

const StoreContext = createContext<GameStore | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => createGameStore(new LocalStorageAdapter(), { autosave: true }), []);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

/** Accès à l'état du jeu et aux actions depuis n'importe quel composant. */
export function useGame() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useGame doit être utilisé dans <GameProvider>');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const player = snapshot.state?.players[snapshot.playerId];
  return { ...snapshot, player, store, dispatch: store.dispatch };
}
