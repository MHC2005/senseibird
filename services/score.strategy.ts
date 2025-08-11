import { IScoreStrategy } from './interfaces';

export class FixedScore implements IScoreStrategy {
  constructor(private points:number=10){}
  score(isCorrect:boolean){ return isCorrect ? this.points : 0; }
}

export class StreakBonusScore implements IScoreStrategy {
  constructor(private base=10){}
  // small illustrative tweak: could be extended to read streak svc
  score(isCorrect:boolean){ return isCorrect ? this.base : 0; }
}
