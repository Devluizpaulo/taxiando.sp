/**
 * Configuração unificada do projeto
 * Gerencia Firebase (legado) e Supabase (novo)
 */

// Configuração do Supabase
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzcbqtowoousgklffnhi.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2JxdG93b291c2drbGZmbmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzE1MzIsImV4cCI6MjA1OTQwNzUzMn0.T1E1DQol6Ld2mVrarSUoEpqcNwDvKaEWTTbM_YmhDm8',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  buckets: {
    public: 'public-images',
    private: 'private-images',
    gallery: 'gallery-images'
  }
} as const;

// Configuração do Firebase (legado)
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCAzvyYFdJKjGKJ-eSP4gbfS6UwFGVc0O4",
  authDomain: "taxiandosp.firebaseapp.com",
  projectId: "taxiandosp",
  storageBucket: "taxiandosp.appspot.com",
  messagingSenderId: "614329407359",
  appId: "1:614329407359:web:0221716ee53e58fd47ec4a",
  measurementId: "G-PLH7F2J30E"
} as const;

// Configuração do sistema de créditos
export const CREDIT_CONFIG = {
  limits: {
    profile: { free: 1, cost: 5 },
    fleet: { free: 1, cost: 10 },
    gallery: { free: 5, cost: 2 },
    blog: { free: 3, cost: 3 },
    cityTip: { free: 2, cost: 5 },
    document: { free: 2, cost: 8 },
    vehicle: { free: 2, cost: 5 }
  },
  adminUnlimited: true
} as const;

// Configuração de upload
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  imageQuality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
} as const;

// Configuração de URLs
export const URL_CONFIG = {
  base: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
} as const;

// Verificar configuração
export function validateConfig() {
  const issues: string[] = [];
  
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    issues.push('Variáveis do Supabase não configuradas');
  }
  
  if (!SUPABASE_CONFIG.serviceKey) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY não configurada (necessária para operações server-side)');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️  Problemas de configuração detectados:', issues);
  }
  
  return issues.length === 0;
}

// Exportar configuração completa
export const CONFIG = {
  supabase: SUPABASE_CONFIG,
  firebase: FIREBASE_CONFIG,
  credits: CREDIT_CONFIG,
  upload: UPLOAD_CONFIG,
  urls: URL_CONFIG,
  validate: validateConfig
} as const; 