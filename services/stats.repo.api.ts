import { IStatsRepo } from './interfaces';

export class ApiStatsRepo implements IStatsRepo {
  constructor(private baseUrl: string){ }

  async load(uid: string){
    try {
      const res = await fetch(`${this.baseUrl}/stats/${encodeURIComponent(uid)}`, { cache: 'no-store' });
      if(!res.ok) return null;
      const data = await res.json();
      return { xp: data.xp ?? 0, streak: data.streak ?? 0 };
    } catch {
      return null;
    }
  }

  async save(uid: string, stats: { xp:number; streak:number }){
    try {
      await fetch(`${this.baseUrl}/stats/${encodeURIComponent(uid)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stats) });
    } catch {
      // swallow in dev
    }
  }
}
