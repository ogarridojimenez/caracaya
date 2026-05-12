import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no permitido. Use JPG, PNG o WebP' }, { status: 400 });
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'El archivo debe ser menor a 2MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${user.id}_${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl, path: data.path });
}