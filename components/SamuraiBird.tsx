'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

type Mood = 'happy'|'wow'|'sad';

export default function SamuraiBird({ mood='happy', size=84 }:{mood?:Mood; size?:number}){
  const animate =
    mood === 'wow' ? { scale: [1, 1.06, 1], y: [0, -6, 0] } :
    mood === 'sad' ? { y: [0, 2, 0], rotate: [0, 1, 0] } :
                     { y: [0, -3, 0], rotate: [0, -1, 0, 1, 0] };

  const wrapperStyle: CSSProperties = { width: size, height: size };

  return (
    <div role="img" aria-label="SenseiBird" className="select-none" style={wrapperStyle}>
      <motion.div animate={animate} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%' }}>
        <Image
          src="/mascot-samurai.png"  /* PNG transparente en public/ */
          alt=""
          width={size} height={size} priority draggable={false}
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        />
      </motion.div>
    </div>
  );
}
