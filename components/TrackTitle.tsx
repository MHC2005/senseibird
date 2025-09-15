'use client';

export default function TrackTitle(){
  const title = process.env.NEXT_PUBLIC_APP_TITLE || 'SenseiBird';
  return <span className="font-semibold" style={{color:'var(--ink-strong)'}}>{title}</span>;
}
