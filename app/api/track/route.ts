import { NextResponse } from 'next/server';

export async function GET() {
  const track = process.env.TRACK || null;
  return NextResponse.json({ track });
}

