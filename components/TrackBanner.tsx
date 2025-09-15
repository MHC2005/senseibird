'use client';
import { useEffect, useState } from 'react';

export default function TrackBanner(){
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

  if(!track) return null;
  const isGreen = track === 'green';
  const bannerClass = isGreen ? 'bg-green-600' : track === 'blue' ? 'bg-blue-600' : '';
  const phrase = 'SenseiBird';
  return (
    <div className={`${bannerClass} text-white text-sm md:text-base text-center py-2 font-semibold`}>
      {phrase}
    </div>
  );
}

