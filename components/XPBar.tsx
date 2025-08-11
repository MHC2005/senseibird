import { levelFromXp } from '@/utils/progression';

export default function XPBar({xp}:{xp:number}){
  const { level, intoLevel, need } = levelFromXp(xp);
  const pct = Math.min(100, Math.round(100 * intoLevel / need));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold">Nivel {level}</div>
        <div className="text-xs" style={{color:'var(--ink)'}}>{intoLevel}/{need} XP</div>
      </div>
      <div className="xp-track w-full h-3 rounded-full overflow-hidden">
        <div className="h-3 rounded-full transition-all" style={{width:`${pct}%`, background: 'linear-gradient(90deg,#f43f5e,#fda4af)'}}/>
      </div>
    </div>
  );
}
