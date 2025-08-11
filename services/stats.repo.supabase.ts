'use client';
import { IStatsRepo } from './interfaces';
import { supabase } from '@/lib/supabase-browser';

export class SupabaseStatsRepo implements IStatsRepo {
  async load(uid: string){
    if(!supabase) return null;
    const { data, error } = await supabase
      .from('user_stats')
      .select('xp, streak')
      .eq('id', uid)
      .maybeSingle();
    if(error) return null;
    return data ? { xp: data.xp, streak: data.streak } : null;
  }
  async save(uid: string, stats: { xp:number; streak:number }){
    if(!supabase) return;
    await supabase.from('user_stats').upsert({ id: uid, xp: stats.xp, streak: stats.streak });
  }
}
