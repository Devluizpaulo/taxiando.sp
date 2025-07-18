import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const BUCKETS = ['logos', 'banners', 'avatars', 'uploads'];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;

  if (!file || !type || !BUCKETS.includes(type)) {
    return NextResponse.json({ error: 'Arquivo ou tipo inválido.' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const { error } = await supabase.storage
    .from(type)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from(type)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.publicUrl });
} 