import { IProgress, IStorage } from './interfaces';
import { levelFromXp } from '@/utils/progression';

export class ProgressService implements IProgress {
  constructor(private storage:IStorage){}
  getXp(){ return parseInt(this.storage.get('xp') || '0'); }
  addXp(delta:number){
    const before = this.getXp();
    const prevLevel = levelFromXp(before).level;
    const after = before + delta;
    this.storage.set('xp', String(after));
    const nowLevel = levelFromXp(after).level;
    return { xp: after, leveledUp: nowLevel>prevLevel, level: nowLevel };
  }
}
