'use client';
import { motion } from 'framer-motion';

export default function Streak({count}:{count:number}){
  return (
    <motion.div initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="inline-flex items-center gap-2 text-sm" style={{color:'var(--ink)'}}>
      <span className="text-lg">🔥</span>
      <span>Racha: <b className="text-[var(--ink-strong)]">{count}</b> día{count===1?'':'s'}</span>
    </motion.div>
  );
}
