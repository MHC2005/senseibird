'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AuthPageContent from './AuthPageContent';

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Cargando login...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
