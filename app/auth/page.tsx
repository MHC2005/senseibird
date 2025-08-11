'use client';
import { supabase } from '@/lib/supabase-browser';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthPage(){
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/';

  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) router.replace(next);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) router.replace(next);
    });
    return () => sub?.subscription.unsubscribe();
  }, [router, next]);

  if(!supabase){
    return (
      <div className="card-white">
        <h1 className="h1">Configura Supabase</h1>
        <p>Falta configurar <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code>.env.local</code>.</p>
      </div>
    );
  }

  return (
    <div className="card-white max-w-md mx-auto">
      <h1 className="h1 mb-4">Entrar a SenseiBird</h1>
      <Auth
        supabaseClient={supabase}
        providers={['google','github']}
        appearance={{ theme: ThemeSupa }}
        magicLink
        redirectTo={`${typeof window!=='undefined'?window.location.origin:''}/auth?next=${encodeURIComponent(next)}`}
      />
      <p className="text-xs mt-3">Tras iniciar sesión te llevamos a: <code>{next}</code></p>
    </div>
  );
}
