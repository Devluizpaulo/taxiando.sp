/**
 * Utilitários para migração do Firebase para Supabase
 * Facilita a transição gradual entre os sistemas
 */

import { supabase, supabaseServer, convertSupabaseData } from './supabaseClient';
import { adminDB, adminAuth, adminStorage } from './firebase-admin';
import { CONFIG } from './config';

// Tipos para migração
export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
  details?: any;
}

export interface MigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  continueOnError?: boolean;
}

/**
 * Migrar dados de usuários do Firebase para Supabase
 */
export async function migrateUsers(options: MigrationOptions = {}): Promise<MigrationResult> {
  const { batchSize = 50, dryRun = false, continueOnError = false } = options;
  const errors: string[] = [];
  let migrated = 0;

  try {
    // Buscar usuários do Firebase
    const usersSnapshot = await adminDB.collection('users').limit(batchSize).get();
    
    if (dryRun) {
      console.log(`[DRY RUN] Encontrados ${usersSnapshot.size} usuários para migrar`);
      return { success: true, migrated: usersSnapshot.size, errors: [] };
    }

    for (const doc of usersSnapshot.docs) {
      try {
        const userData = doc.data();
        
        // Converter dados para formato Supabase
        const supabaseUser = {
          id: doc.id,
          email: userData.email,
          name: userData.name || '',
          role: userData.role || 'user',
          phone: userData.phone || '',
          photo_url: userData.photoURL || '',
          created_at: userData.createdAt || new Date().toISOString(),
          updated_at: userData.updatedAt || new Date().toISOString(),
          credits: userData.credits || 100, // Créditos iniciais
          is_active: userData.isActive !== false
        };

        // Inserir no Supabase
        const { error } = await supabaseServer
          .from('users')
          .upsert(supabaseUser, { onConflict: 'id' });

        if (error) {
          errors.push(`Erro ao migrar usuário ${doc.id}: ${error.message}`);
          if (!continueOnError) throw error;
        } else {
          migrated++;
        }
      } catch (error) {
        const errorMsg = `Erro ao processar usuário ${doc.id}: ${(error as Error).message}`;
        errors.push(errorMsg);
        if (!continueOnError) throw error;
      }
    }

    return { success: true, migrated, errors };
  } catch (error) {
    return { 
      success: false, 
      migrated, 
      errors: [...errors, `Erro geral: ${(error as Error).message}`] 
    };
  }
}

/**
 * Migrar imagens do Firebase Storage para Supabase Storage
 */
export async function migrateImages(options: MigrationOptions = {}): Promise<MigrationResult> {
  const { batchSize = 10, dryRun = false, continueOnError = false } = options;
  const errors: string[] = [];
  let migrated = 0;

  try {
    // Listar arquivos do Firebase Storage
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles({ maxResults: batchSize });

    if (dryRun) {
      console.log(`[DRY RUN] Encontrados ${files.length} arquivos para migrar`);
      return { success: true, migrated: files.length, errors: [] };
    }

    for (const file of files) {
      try {
        // Determinar bucket de destino baseado no caminho
        let targetBucket: string = CONFIG.supabase.buckets.public;
        if (file.name.includes('profile') || file.name.includes('private')) {
          targetBucket = CONFIG.supabase.buckets.private;
        } else if (file.name.includes('gallery')) {
          targetBucket = CONFIG.supabase.buckets.gallery;
        }

        // Download do Firebase
        const [buffer] = await file.download();
        
        // Upload para Supabase
        const { error } = await supabaseServer.storage
          .from(targetBucket)
          .upload(file.name, buffer, {
            contentType: file.metadata?.contentType || 'image/jpeg',
            upsert: true
          });

        if (error) {
          errors.push(`Erro ao migrar arquivo ${file.name}: ${error.message}`);
          if (!continueOnError) throw error;
        } else {
          migrated++;
        }
      } catch (error) {
        const errorMsg = `Erro ao processar arquivo ${file.name}: ${(error as Error).message}`;
        errors.push(errorMsg);
        if (!continueOnError) throw error;
      }
    }

    return { success: true, migrated, errors };
  } catch (error) {
    return { 
      success: false, 
      migrated, 
      errors: [...errors, `Erro geral: ${(error as Error).message}`] 
    };
  }
}

/**
 * Verificar compatibilidade entre Firebase e Supabase
 */
export async function checkCompatibility(): Promise<{
  firebase: boolean;
  supabase: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Verificar Firebase
  let firebaseOk = false;
  try {
    await adminDB.collection('users').limit(1).get();
    firebaseOk = true;
  } catch (error) {
    issues.push(`Firebase: ${(error as Error).message}`);
  }

  // Verificar Supabase
  let supabaseOk = false;
  try {
    const { error } = await supabaseServer.from('users').select('count').limit(1);
    if (!error) {
      supabaseOk = true;
    } else {
      issues.push(`Supabase: ${error.message}`);
    }
  } catch (error) {
    issues.push(`Supabase: ${(error as Error).message}`);
  }

  return { firebase: firebaseOk, supabase: supabaseOk, issues };
}

/**
 * Gerar relatório de migração
 */
export async function generateMigrationReport(): Promise<{
  firebase: { users: number; images: number };
  supabase: { users: number; images: number };
  recommendations: string[];
}> {
  const recommendations: string[] = [];

  // Contar usuários no Firebase
  let firebaseUsers = 0;
  try {
    const usersSnapshot = await adminDB.collection('users').get();
    firebaseUsers = usersSnapshot.size;
  } catch (error) {
    recommendations.push('Não foi possível contar usuários no Firebase');
  }

  // Contar usuários no Supabase
  let supabaseUsers = 0;
  try {
    const { count } = await supabaseServer.from('users').select('*', { count: 'exact', head: true });
    supabaseUsers = count || 0;
  } catch (error) {
    recommendations.push('Não foi possível contar usuários no Supabase');
  }

  // Contar imagens no Firebase Storage
  let firebaseImages = 0;
  try {
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles();
    firebaseImages = files.length;
  } catch (error) {
    recommendations.push('Não foi possível contar imagens no Firebase Storage');
  }

  // Contar imagens no Supabase Storage
  let supabaseImages = 0;
  try {
    const { data: publicImages } = await supabaseServer.storage.from(CONFIG.supabase.buckets.public).list();
    const { data: privateImages } = await supabaseServer.storage.from(CONFIG.supabase.buckets.private).list();
    const { data: galleryImages } = await supabaseServer.storage.from(CONFIG.supabase.buckets.gallery).list();
    
    supabaseImages = (publicImages?.length || 0) + (privateImages?.length || 0) + (galleryImages?.length || 0);
  } catch (error) {
    recommendations.push('Não foi possível contar imagens no Supabase Storage');
  }

  // Gerar recomendações
  if (firebaseUsers > 0 && supabaseUsers === 0) {
    recommendations.push('Migrar usuários do Firebase para Supabase');
  }
  
  if (firebaseImages > 0 && supabaseImages === 0) {
    recommendations.push('Migrar imagens do Firebase Storage para Supabase Storage');
  }

  if (firebaseUsers > 0 && supabaseUsers > 0) {
    recommendations.push('Verificar duplicação de dados entre Firebase e Supabase');
  }

  return {
    firebase: { users: firebaseUsers, images: firebaseImages },
    supabase: { users: supabaseUsers, images: supabaseImages },
    recommendations
  };
} 