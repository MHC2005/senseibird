'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [dark, setDark] = useState(true);
  useEffect(()=>{
    const s = localStorage.getItem('theme') || 'dark';
    setDark(s==='dark');
    document.documentElement.dataset.theme = s;
  },[]);
  function toggle(){
    const next = dark ? 'paper' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.dataset.theme = next;
    setDark(!dark);
  }
  return (
    <button onClick={toggle} className="btn" title="Cambiar tema">
      {dark ? '🌖' : '🧾'} Tema
    </button>
  );
}
