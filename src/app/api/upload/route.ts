import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const BUCKET = 'uploads';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;
  const userId = formData.get('userId') as string | undefined;

  if (!file || !type) {
    return NextResponse.json({ error: 'Arquivo ou tipo não enviado.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Arquivo muito grande. O limite é 2MB.' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const safeType = type.replace(/[^a-zA-Z0-9-_]/g, '');
  const idPart = userId ? `_${userId}` : '';
  const fileName = `${safeType}/${Date.now()}${idPart}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.publicUrl });
} 