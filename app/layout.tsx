import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import SamuraiBird from "@/components/SamuraiBird";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { ServicesProvider } from "./providers";

export const metadata: Metadata = {
  title: "SenseiBird - Aprende Japonés",
  description: "SenseiBird te guía por kana y frases básicas con quizzes y racha diaria.",
};

export default function Root({children}:{children:React.ReactNode}){
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <ServicesProvider>
          <header className="border-b border-red-900/20" style={{background:'var(--header)'}}>
            <div className="container py-3 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <SamuraiBird size={42} />
                <nav className="text-sm flex gap-4">
                  <Link className="link" href="/">Inicio</Link>
                  <Link className="link" href="/course">Curso</Link>
                  <Link className="link" href="/lesson/kana">Quiz Kana</Link>
                  <Link className="link" href="/lesson/frases">Quiz Frases</Link>
                </nav>
              </div>
              <div className="flex items-center gap-2"><ThemeToggle /><UserMenu /></div>
            </div>
          </header>
          <main className="container py-6 flex-1">
            {children}
          </main>
          <footer className="py-8 text-center text-xs opacity-90" style={{color:'var(--ink)'}}>
            Nanakorobi yaoki (七転び八起き): <i>“Cae siete veces, levántate ocho.”</i> 🇯🇵
            <div className="mt-2">
              Hecho por <a className="link" href="https://www.linkedin.com/in/mateo-hernandez-cedres/" target="_blank" rel="noopener noreferrer">Mateo Hernández</a>
            </div>
          </footer>
        </ServicesProvider>
      </body>
    </html>
  );
}
