import { describe, it, expect } from 'vitest';
import { xpForLevel, levelFromXp } from '../utils/progression';

describe('progression', () => {
  it('xpForLevel increases linearly', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(150);
  });
  it('levelFromXp computes levels', () => {
    const r1 = levelFromXp(0);
    expect(r1.level).toBe(1);
    const r2 = levelFromXp(100);
    expect(r2.level).toBe(2);
  });
});
