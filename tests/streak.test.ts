import { describe, it, expect, vi } from 'vitest';
import { StreakService } from '../services/streak.service';
import { IStorage } from '../services/interfaces';

class MemStore implements IStorage {
  data = new Map<string,string>();
  get(k:string){ return this.data.get(k) || null; }
  set(k:string,v:string){ this.data.set(k,v); }
}

describe('streak', () => {
  it('starts at 1 when first practice happens', () => {
    const s = new StreakService(new MemStore());
    const r = s.markPracticeNow();
    expect(r.count).toBe(1);
  });
});
