export default function FlagJP({size=24}:{size?:number}){
  const s = size;
  return (
    <svg width={s} height={s*2/3} viewBox="0 0 3 2" aria-label="Bandera de Japón">
      <rect width="3" height="2" fill="#fff"/>
      <circle cx="1.5" cy="1" r="0.6" fill="#d32f2f"/>
    </svg>
  );
}
