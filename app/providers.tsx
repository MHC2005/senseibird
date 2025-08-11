'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IEventBus, IProgress, IStreak, ITTS, IAuth, IStatsRepo } from '@/services/interfaces';
import { LocalStorage } from '@/services/storage.local';
import { ProgressService } from '@/services/progress.service';
import { StreakService } from '@/services/streak.service';
import { WebSpeechTTS } from '@/services/tts.webspeech';
import { SimpleEventBus } from '@/services/eventbus.simple';
import { SupabaseStatsRepo } from '@/services/stats.repo.supabase';
import { LocalStatsRepo } from '@/services/stats.repo.local';
import { supabase } from '@/lib/supabase-browser';

function useAuth(): IAuth {
  return {
    userId: () => null,
    onChange: (cb) => {
      if(!supabase) { cb(null); return () => {}; }
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user?.id || null));
      supabase.auth.getSession().then(({data})=> cb(data.session?.user?.id || null));
      return () => sub?.subscription.unsubscribe();
    },
    signOut: async () => { await supabase?.auth.signOut(); }
  };
}

export type Services = {
  bus: IEventBus;
  progress: IProgress;
  streak: IStreak;
  tts: ITTS;
  auth: IAuth;
  stats: IStatsRepo;
  uid: string | null;
};

const Ctx = createContext<Services | null>(null);

export function ServicesProvider({children}:{children:React.ReactNode}){
  const [uid, setUid] = useState<string|null>(null);

  const baseServices = useMemo(() => {
    const storage = new LocalStorage();
    return {
      bus: new SimpleEventBus(),
      progress: new ProgressService(storage),
      streak: new StreakService(storage),
      tts: new WebSpeechTTS(),
    };
  }, []);

  const auth = useAuth();
  const stats = supabase ? new SupabaseStatsRepo() : new LocalStatsRepo();

  // Sync from remote on login
  useEffect(()=> auth.onChange(setUid), []);

  useEffect(()=>{
    if(!uid) return;
    (async () => {
      const remote = await stats.load(uid);
      if(!remote) return;
      const localXp = baseServices.progress.getXp();
      const localStreak = baseServices.streak.get().count;
      const mergedXp = Math.max(remote.xp, localXp);
      const mergedStreak = Math.max(remote.streak, localStreak);
      // save back locally
      if(mergedXp !== localXp) baseServices.progress.addXp(mergedXp - localXp);
      if(mergedStreak !== localStreak) {
        // set directly into local storage to avoid cheating side effects
        localStorage.setItem('streak', String(mergedStreak));
      }
    })();
  }, [uid]);

  // Sync to remote on bus events
  useEffect(()=>{
    if(!uid) return;
    const off1 = baseServices.bus.on('levelup', async (_:any)=>{
      await stats.save(uid, { xp: baseServices.progress.getXp(), streak: baseServices.streak.get().count });
    });
    const off2 = baseServices.bus.on('streakupdate', async (_:any)=>{
      await stats.save(uid, { xp: baseServices.progress.getXp(), streak: baseServices.streak.get().count });
    });
    return ()=> { off1(); off2(); };
  }, [uid]);

  const services = useMemo(() => ({
    ...baseServices, auth, stats, uid
  }), [baseServices, auth, stats, uid]);

  return <Ctx.Provider value={services}>{children}</Ctx.Provider>;
}

export function useServices(){
  const ctx = useContext(Ctx);
  if(!ctx) throw new Error('Services not available');
  return ctx;
}
