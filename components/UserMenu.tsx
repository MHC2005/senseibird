'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-browser';

export default function UserMenu(){
  const [uid, setUid] = useState<string|null>(null);
  useEffect(()=>{
    if(!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUid(session?.user?.id || null));
    supabase.auth.getSession().then(({data})=> setUid(data.session?.user?.id || null));
    return ()=> sub?.subscription.unsubscribe();
  },[]);

  if(!supabase) return null;

  if(!uid){
    return <Link className="btn" href="/auth">Entrar</Link>;
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs opacity-80">Conectado</span>
      <button className="btn" onClick={()=>supabase.auth.signOut()}>Salir</button>
    </div>
  );
}
