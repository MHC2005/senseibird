// Simple storage facade (Dependency Inversion)
export interface IStorage {
  get(key:string): string | null;
  set(key:string, value:string): void;
}

export class LocalStorage implements IStorage {
  get(key:string){ try { return localStorage.getItem(key); } catch { return null; } }
  set(key:string, value:string){ try { localStorage.setItem(key, value); } catch {} }
}
