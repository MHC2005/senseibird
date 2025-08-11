'use client';
// Controller/Information Expert (GRASP) for quizzes
import { useEffect, useMemo, useState } from 'react';

export function useQuiz<T>(items:T[], getCorrect:(t:T)=>string, allOptions:(t:T)=>string[]){
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string|null>(null);
  const [correct, setCorrect] = useState<string>('');

  const current = items[idx % items.length];

  useEffect(()=>{
    setSelected(null);
    setCorrect(getCorrect(current));
  }, [idx, current]);

  const options = useMemo(()=>{
    const opts = allOptions(current);
    return opts.sort(()=>Math.random()-0.5);
  }, [current, allOptions]);

  function pick(ans:string){
    if(selected) return false;
    setSelected(ans);
    setTimeout(()=> setIdx(idx+1), 850);
    return ans === correct;
  }

  return { idx, current, options, correct, selected, pick, next:()=>setIdx(idx+1) };
}
