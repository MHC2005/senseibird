import { IStorage } from './interfaces';

export class LocalStorage implements IStorage {
  get(key: string) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch {}
  }
}
