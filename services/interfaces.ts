export interface IStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export interface IEventBus {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void): () => void;
}

export interface IProgress {
  addXp(delta: number): { xp: number; leveledUp: boolean; level: number };
  getXp(): number;
}

export interface IStreak {
  markPracticeNow(): { count: number; changed: boolean };
  get(): { count: number; last: string };
}

export interface ITTS {
  speak(text: string, lang?: string): boolean;
}

export type Question = { prompt: string; answer: string; options: string[]; tts?: string };

export interface IQuestionRepo {
  next(idx: number): Question;
  count(): number;
}

export interface IScoreStrategy {
  score(isCorrect: boolean): number;
}

export interface IAuth {
  userId(): string | null;
  onChange(cb: (uid: string | null) => void): () => void;
  signOut(): Promise<void>;
}

export interface IStatsRepo {
  load(uid: string): Promise<{ xp: number; streak: number } | null>;
  save(uid: string, stats: { xp: number; streak: number }): Promise<void>;
}
