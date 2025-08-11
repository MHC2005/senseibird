'use client';
import { motion, AnimatePresence } from 'framer-motion';
import SamuraiBird from './SamuraiBird';

export default function LevelUp({show, level, onClose}:{show:boolean, level:number, onClose:()=>void}){
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ scale: 0.8, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 12 }}
            className="card-white text-center max-w-sm">
            <div className="flex items-center justify-center gap-3 mb-3">
              <SamuraiBird mood="wow" size={72}/>
              <h3 className="text-2xl font-extrabold" style={{color:'var(--ink-strong)'}}>¡Nivel {level}!</h3>
            </div>
            <p className="text-sm" style={{color:'var(--ink)'}}>El SenseiBird está orgulloso. ¡Sigue así! 🗡️</p>
            <button className="btn mt-4" onClick={onClose}>Seguir</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
