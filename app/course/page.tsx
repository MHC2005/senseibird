import Link from "next/link";
import SamuraiBird from "@/components/SamuraiBird";

export default function Course(){
  return (
    <div className="space-y-6">
      <header className="card-white flex items-center gap-4">
        <SamuraiBird size={80}/>
        <div>
          <h1 className="h1">Curso básico</h1>
          <p className="text-sm" style={{color:'var(--ink)'}}>Lecciones cortas y directas para aprender antes del quiz.</p>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 gap-6">
        <Link href="/course/kana-basics" className="card-white hover:opacity-95 block">
          <h3 className="text-xl font-semibold" style={{color:'var(--ink-strong)'}}>Kana — Vocales y K</h3>
          <p className="text-sm" style={{color:'var(--ink)'}}>あ a, い i, う u, え e, お o + か き く け こ</p>
        </Link>
        <Link href="/course/frases-saludos" className="card-white hover:opacity-95 block">
          <h3 className="text-xl font-semibold" style={{color:'var(--ink-strong)'}}>Frases — Saludos</h3>
          <p className="text-sm" style={{color:'var(--ink)'}}>こんにちは, ありがとう, お願いします, すみません…</p>
        </Link>
      </section>
    </div>
  );
}
