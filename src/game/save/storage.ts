/**
 * Abstraction du stockage. Le MVP utilise le localStorage du navigateur ;
 * plus tard, un `RemoteStorageAdapter` pourra parler à un serveur (REST/WebSocket)
 * sans changer le reste du jeu.
 */
export interface StorageAdapter {
  load(key: string): Promise<string | null>;
  save(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async load(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  async save(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  async remove(key: string) {
    localStorage.removeItem(key);
  }
  async list(prefix: string) {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) keys.push(k);
    }
    return keys;
  }
}

/** Stockage en mémoire : tests unitaires et environnements sans navigateur. */
export class MemoryStorageAdapter implements StorageAdapter {
  private data = new Map<string, string>();
  async load(key: string) {
    return this.data.get(key) ?? null;
  }
  async save(key: string, value: string) {
    this.data.set(key, value);
  }
  async remove(key: string) {
    this.data.delete(key);
  }
  async list(prefix: string) {
    return [...this.data.keys()].filter((k) => k.startsWith(prefix));
  }
}
