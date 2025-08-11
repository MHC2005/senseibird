import { IQuestionRepo, Question } from './interfaces';
import kana from '@/data/kana.json';
import phrases from '@/data/phrases.json';

function shuffle<T>(arr:T[]):T[]{ return [...arr].sort(()=>Math.random()-0.5); }

const kanaQs: Question[] = kana.map(k => ({
  prompt: k.kana,
  answer: k.romaji,
  options: shuffle([k.romaji, ...shuffle(kana.filter(x=>x.romaji!==k.romaji)).slice(0,3).map(x=>x.romaji)]),
  tts: k.kana
}));

const phraseQs: Question[] = phrases.map(p => ({
  prompt: `「${p.jp}」`,
  answer: p.es,
  options: shuffle([p.es, ...shuffle(phrases.filter(x=>x.es!==p.es)).slice(0,3).map(x=>x.es)]),
  tts: p.jp
}));

export class StaticQuestionRepo implements IQuestionRepo {
  constructor(private which:'kana'|'phrases'){}
  next(idx:number){ 
    const list = this.which==='kana' ? kanaQs : phraseQs;
    return list[idx % list.length];
  }
  count(){ return (this.which==='kana' ? kanaQs : phraseQs).length; }
}
