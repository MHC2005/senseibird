'use client';
import { useEffect, useState } from 'react';
import SamuraiBird from '@/components/SamuraiBird';
import data from '@/data/kana.json';
import { levelFromXp } from '@/utils/progression';
import { useServices } from '@/app/providers';

type Item = { kana:string; romaji:string };
function shuffle<T>(arr:T[]):T[] { return [...arr].sort(()=>Math.random()-0.5); }

export default function KanaLesson(){
  const { progress, streak, bus, tts } = useServices();
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string|null>(null);
  const [correct, setCorrect] = useState<string>('');
  const [good, setGood] = useState<boolean|null>(null);
  const [xp, setXp] = useState(0);

  useEffect(()=>{ setXp(progress.getXp()); },[]);

  const item: Item = data[idx % data.length];

  useEffect(()=>{
    const opts = shuffle([item.romaji, ...shuffle(data.filter(d=>d.romaji!==item.romaji)).slice(0,3).map(d=>d.romaji)]);
    setChoices(opts); setSelected(null); setGood(null); setCorrect(item.romaji);
  }, [idx]);

  function pick(ans:string){
    if(selected) return;
    setSelected(ans);
    const ok = ans===item.romaji;
    setGood(ok);
    if(ok){
      const res = progress.addXp(10); setXp(res.xp);
      if(res.leveledUp){ bus.emit('levelup', { level: levelFromXp(res.xp).level }); }
      const s = streak.markPracticeNow();
      if(s.changed){ bus.emit('streakupdate', { count: s.count }); }
    }
    setTimeout(()=> setIdx(idx+1), 850);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <SamuraiBird size={64} mood={good===null?'happy':(good?'wow':'sad')}/>
        <div>
          <h2 className="text-2xl font-bold" style={{color:'var(--ink-strong)'}}>Entrenador de Kana</h2>
          <p className="text-xs" style={{color:'var(--ink)'}}>¿Cómo se lee este carácter? (+10 XP si aciertas)</p>
        </div>
      </header>

      <div className="card-white text-center">
        <div className="text-7xl mb-4" style={{color:'var(--ink-strong)'}}>{item.kana}</div>
        <div className="flex justify-center mb-4">
          <button className="btn" onClick={()=>tts.speak(item.kana)}>🔊 Escuchar</button>
        </div>
        <div className="grid grid-cols-2 gap-3" role="listbox" aria-label="Opciones de lectura">
          {choices.map((c,i)=>{
            let cls = "btn transition-colors";
            if(selected){
              if(c === correct) cls += " !bg-green-600";
              if(c === selected && c !== correct) cls += " !bg-red-600";
              if(c !== selected && c !== correct) cls += " opacity-60";
            }
            return (
              <button key={i} onClick={()=>pick(c)} disabled={!!selected} className={cls} role="option" aria-selected={selected===c}>
                {c}
              </button>
            );
          })}
        </div>
        <div className="text-xs mt-3" style={{color:'var(--ink)'}}>{xp} XP</div>
      </div>
    </div>
  );
}
