import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzcbqtowoousgklffnhi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2JxdG93b291c2drbGZmbmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzE1MzIsImV4cCI6MjA1OTQwNzUzMn0.T1E1DQol6Ld2mVrarSUoEpqcNwDvKaEWTTbM_YmhDm8';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Variáveis do Supabase não configuradas. Usando valores padrão.');
}

// Cliente Supabase para uso no cliente (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'taxiandosp-portal'
    }
  }
});

// Cliente para uso no servidor com permissões elevadas
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente para operações administrativas (server-side)
export const createServiceClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Função utilitária para converter timestamps do Supabase
 */
export function convertSupabaseTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  return new Date(timestamp).toISOString();
}

/**
 * Função utilitária para converter dados do Supabase para formato compatível
 */
export function convertSupabaseData<T>(data: any): T {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Converter timestamps
  if (converted.created_at) {
    converted.createdAt = convertSupabaseTimestamp(converted.created_at);
    delete converted.created_at;
  }
  
  if (converted.updated_at) {
    converted.updatedAt = convertSupabaseTimestamp(converted.updated_at);
    delete converted.updated_at;
  }
  
  return converted;
}

// Tipos úteis
export type SupabaseClient = typeof supabase;
export type ServiceClient = ReturnType<typeof createServiceClient>; 