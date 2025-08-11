import { IStreak, IStorage } from './interfaces';

function todayKey(d=new Date()){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

export class StreakService implements IStreak {
  constructor(private storage:IStorage){}
  get(){
    const cnt = parseInt(this.storage.get('streak') || '0');
    const last = this.storage.get('streak_last') || '';
    return { count: isNaN(cnt) ? 0 : cnt, last };
  }
  markPracticeNow(){
    const { count, last } = this.get();
    const today = todayKey();
    if(last === today) return { count, changed: false };
    const y = new Date(); y.setDate(y.getDate()-1);
    const yesterday = todayKey(y);
    const next = (last === yesterday) ? count + 1 : 1;
    this.storage.set('streak', String(next));
    this.storage.set('streak_last', today);
    return { count: next, changed: true };
  }
}
