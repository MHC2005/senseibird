const KEY = 'streak';
const KEY_LAST = 'streak_last';
function todayKey(d=new Date()){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
export function loadStreak(){
  const cnt = parseInt(localStorage.getItem(KEY) || '0');
  const last = localStorage.getItem(KEY_LAST) || '';
  return { count: isNaN(cnt) ? 0 : cnt, last };
}
export function markPracticeNow(){
  const { count, last } = loadStreak();
  const today = todayKey();
  if(last === today) return { count, changed:false };
  const y = new Date(); y.setDate(y.getDate()-1);
  const yesterday = todayKey(y);
  const next = (last === yesterday) ? count + 1 : 1;
  localStorage.setItem(KEY, String(next));
  localStorage.setItem(KEY_LAST, today);
  return { count: next, changed: true };
}
