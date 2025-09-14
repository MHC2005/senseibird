'use client';
import Link from "next/link";
import SamuraiBird from "@/components/SamuraiBird";
import XPBar from "@/components/XPBar";
import LevelUp from "@/components/LevelUp";
import Streak from "@/components/Streak";
import TrackTitle from "@/components/TrackTitle";
import { useEffect, useState } from "react";
import { loadXp, levelFromXp } from "@/utils/progression";
import { loadStreak } from "@/utils/streak";

export default function Home(){
  const [xp, setXp] = useState(0);
  const [levelUpShow, setLevelUpShow] = useState(false);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  useEffect(()=>{
    const x = loadXp(); setXp(x); setLevel(levelFromXp(x).level);
    const s = loadStreak(); setStreak(s.count);
    const onLev = (e:any)=>{ setLevelUpShow(true); setLevel(e.detail.level); };
    const onStreak = (e:any)=>{ setStreak(e.detail.count); };
    window.addEventListener('levelup', onLev as any);
    window.addEventListener('streakupdate', onStreak as any);
    return ()=>{
      window.removeEventListener('levelup', onLev as any);
      window.removeEventListener('streakupdate', onStreak as any);
    };
  },[]);

  return (
    <div className="space-y-8">
      <section className="hero card-white flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h1 className="h1 flex items-center gap-3">
            <TrackTitle />
          </h1>
          <p style={{color:'var(--ink)'}}>Tu pájaro samurái te guía por kana y frases básicas.</p>
          <div className="mt-2"><Streak count={streak}/></div>
        </div>
        <div className="shrink-0"><SamuraiBird size={140}/></div>
      </section>

      <section className="card-white">
        <XPBar xp={xp}/>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Link className="card-white hover:opacity-95 block" href="/course">
          <h3 className="text-xl font-semibold" style={{color:'var(--ink-strong)'}}>Curso</h3>
          <p className="text-sm" style={{color:'var(--ink)'}}>Lecciones teóricas cortas antes de practicar</p>
        </Link>
        <Link className="card-white hover:opacity-95 block" href="/lesson/kana">
          <h3 className="text-xl font-semibold" style={{color:'var(--ink-strong)'}}>Entrenador de Kana</h3>
          <p className="text-sm" style={{color:'var(--ink)'}}>Hiragana/Katakana — elige la lectura correcta</p>
        </Link>
        <Link className="card-white hover:opacity-95 block" href="/lesson/frases">
          <h3 className="text-xl font-semibold" style={{color:'var(--ink-strong)'}}>Quiz de Frases</h3>
          <p className="text-sm" style={{color:'var(--ink)'}}>Frases esenciales con audio y feedback visual</p>
        </Link>
      </section>

      <LevelUp show={levelUpShow} level={level} onClose={()=>setLevelUpShow(false)}/>
    </div>
  );
}

