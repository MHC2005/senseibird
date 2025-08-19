'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function UserMenu() {
  const supabase = useSupabaseClient();

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs opacity-80">Conectado</span>
      <button
        className="btn"
        onClick={() => supabase?.auth.signOut()}
        disabled={!supabase}
      >
        Salir
      </button>
    </div>
  );
}
