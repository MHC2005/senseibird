'use client';
import { useEffect, useState } from 'react';

export default function TrackTitle(){
  const [track, setTrack] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/track', { cache: 'no-store' });
        if(!res.ok) return;
        const data = await res.json();
        if(!cancelled) setTrack(data.track || null);
      } catch {/* ignore */}
    })();
    return () => { cancelled = true; };
  }, []);

  // Blue => Chino, Green => Japonés
  const phrase = track === 'blue' ? 'SenseiBird - Aprender Chino' : 'SenseiBird - Aprender Japonés';
  return <span className="font-semibold" style={{color:'var(--ink-strong)'}}>{phrase}</span>;
}

