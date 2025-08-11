import { IEventBus } from './interfaces';

export class SimpleEventBus implements IEventBus {
  private listeners = new Map<string, Set<(p:any)=>void>>();
  emit<T>(event: string, payload: T){
    const set = this.listeners.get(event);
    if(!set) return;
    for(const h of set) { try{ h(payload); } catch{} }
  }
  on<T>(event: string, handler: (payload:T)=>void){
    const set = this.listeners.get(event) || new Set();
    set.add(handler as any);
    this.listeners.set(event, set);
    return () => set.delete(handler as any);
  }
}
