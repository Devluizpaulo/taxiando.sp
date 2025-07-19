import { NextRequest, NextResponse } from 'next/server';
import { gerarDicaComIA } from '@/ai/genkit';

export async function POST(req: NextRequest) {
  const { title, address, description } = await req.json();
  const result = await gerarDicaComIA({ title, address, description });
  return NextResponse.json(result);
} 