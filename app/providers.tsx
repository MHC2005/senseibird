'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IEventBus, IProgress, IStreak, ITTS, IAuth, IStatsRepo } from '@/services/interfaces';
import { LocalStorage } from '@/services/storage.local';
import { ProgressService } from '@/services/progress.service';
import { StreakService } from '@/services/streak.service';
import { WebSpeechTTS } from '@/services/tts.webspeech';
import { SimpleEventBus } from '@/services/eventbus.simple';
import { LocalStatsRepo } from '@/services/stats.repo.local';
import { ApiStatsRepo } from '@/services/stats.repo.api';

function useAuth(): IAuth {
  // Placeholder local auth until FastAPI auth is integrated
  return {
    userId: () => null,
    onChange: (cb) => { cb(null); return () => {}; },
    signOut: async () => { /* no-op */ }
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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const stats: IStatsRepo = apiBase ? new ApiStatsRepo(apiBase) : new LocalStatsRepo();

  // Asignar un uid de dispositivo local para sincronizar con FastAPI
  useEffect(()=>{
    const localId = typeof window !== 'undefined' ? localStorage.getItem('device_uid') : null;
    if(localId){ setUid(localId); return; }
    const newId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now());
    if(typeof window !== 'undefined') localStorage.setItem('device_uid', newId);
    setUid(newId);
  }, []);

  useEffect(()=>{
    if(!uid) return;
    (async () => {
      const remote = await stats.load(uid);
      if(!remote) return;
      const localXp = baseServices.progress.getXp();
      const localStreak = baseServices.streak.get().count;
      const mergedXp = Math.max(remote.xp, localXp);
      const mergedStreak = Math.max(remote.streak, localStreak);
      if(mergedXp !== localXp) baseServices.progress.addXp(mergedXp - localXp);
      if(mergedStreak !== localStreak) {
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
