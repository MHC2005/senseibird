'use client';
import { useEffect, useMemo, useState } from 'react';
import SamuraiBird from '@/components/SamuraiBird';
import list from '@/data/phrases.json';
import { awardXp, levelFromXp } from '@/utils/progression';
import { markPracticeNow } from '@/utils/streak';
import { speak } from '@/utils/tts';

type P = { jp:string; romaji:string; es:string };
function shuffle<T>(arr:T[]):T[] { return [...arr].sort(()=>Math.random()-0.5); }

export default function FrasesQuiz(){
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string|null>(null);
  const [good, setGood] = useState<boolean|null>(null);
  const [xp, setXp] = useState(0);

  useEffect(()=>{ setXp(parseInt(localStorage.getItem('xp')||'0')); },[]);

  // Reset lock when index changes (bug fix)
  useEffect(()=>{ setSelected(null); setGood(null); }, [idx]);

  const phrase: P = list[idx % list.length];

  const choices = useMemo(()=>{
    const others = shuffle(list.filter(p=>p.es!==phrase.es)).slice(0,3).map(p=>p.es);
    return shuffle([phrase.es, ...others]);
  }, [phrase]);

  function pick(ans:string){
    if(selected) return; // prevent double click
    setSelected(ans);
    const ok = ans===phrase.es;
    setGood(ok);
    if(ok){
      const res = awardXp(10); setXp(res.xp);
      if(res.leveledUp){
        const lev = levelFromXp(res.xp).level;
        window.dispatchEvent(new CustomEvent('levelup', { detail: { level: lev } }));
      }
      const s = markPracticeNow();
      if(s.changed){
        window.dispatchEvent(new CustomEvent('streakupdate', { detail: { count: s.count } }));
      }
    }
    setTimeout(()=> setIdx(idx+1), 850);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <SamuraiBird size={64} mood={good===null?'happy':(good?'wow':'sad')} />
        <div>
          <h2 className="text-2xl font-bold" style={{color:'var(--ink-strong)'}}>Quiz de Frases</h2>
          <p className="text-xs" style={{color:'var(--ink)'}}>Selecciona la traducción correcta (+10 XP si aciertas)</p>
        </div>
      </header>

      <div className="card-white space-y-4 text-center">
        <div className="text-3xl" style={{color:'var(--ink-strong)'}}>「{phrase.jp}」</div>
        <div className="text-sm" style={{color:'var(--ink)'}}>Romaji: {phrase.romaji}</div>
        <div className="flex justify-center">
          <button className="btn" onClick={()=>speak(phrase.jp)}>🔊 Escuchar</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {choices.map((c,i)=>{
            let cls = "btn transition-colors";
            if(selected){
              if(c === phrase.es) cls += " !bg-green-500";
              if(c === selected && c !== phrase.es) cls += " !bg-red-500";
              if(c !== selected && c !== phrase.es) cls += " opacity-60";
            }
            return (
              <button key={i} onClick={()=>pick(c)} disabled={!!selected} className={cls}>
                {c}
              </button>
            );
          })}
        </div>
        <div className="text-xs mt-1" style={{color:'var(--ink)'}}>{xp} XP</div>
      </div>
    </div>
  );
}
