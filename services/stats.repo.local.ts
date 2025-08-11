import { IStatsRepo } from './interfaces';

export class LocalStatsRepo implements IStatsRepo {
  async load(uid: string){
    const xp = parseInt(localStorage.getItem('xp') || '0');
    const streak = parseInt(localStorage.getItem('streak') || '0');
    return { xp, streak };
  }
  async save(uid: string, stats: { xp:number; streak:number }){
    localStorage.setItem('xp', String(stats.xp));
    localStorage.setItem('streak', String(stats.streak));
  }
}
