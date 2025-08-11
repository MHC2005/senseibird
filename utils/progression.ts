export function xpForLevel(level:number){ return 100 + (level-1)*50; }
export function levelFromXp(xp:number){
  let level = 1, remain = xp, need = xpForLevel(level);
  while(remain >= need){ remain -= need; level++; need = xpForLevel(level); }
  return { level, intoLevel: remain, need };
}
export function loadXp(){ return parseInt(localStorage.getItem('xp')||'0'); }
export function saveXp(xp:number){ localStorage.setItem('xp', String(xp)); }
export function awardXp(delta:number){
  const before = loadXp();
  const prev = levelFromXp(before).level;
  const after = before + delta;
  saveXp(after);
  const now = levelFromXp(after).level;
  const leveledUp = now > prev;
  return { xp: after, leveledUp, level: now };
}
