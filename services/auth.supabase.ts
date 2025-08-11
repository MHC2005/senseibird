'use client';
import { IAuth } from './interfaces';
import { supabase } from '@/lib/supabase-browser';

export class SupabaseAuth implements IAuth {
  userId(){ return (supabase?.auth.getUser as any) ? null : null; }
  onChange(cb:(uid:string|null)=>void){
    if(!supabase) return () => {};
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      cb(session?.user?.id || null);
    });
    // emit initial
    supabase.auth.getSession().then(({data})=> cb(data.session?.user?.id || null));
    return () => { sub?.subscription.unsubscribe(); };
  }
  async signOut(){ await supabase?.auth.signOut(); }
}
