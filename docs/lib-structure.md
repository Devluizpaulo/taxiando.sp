# 📁 Estrutura da Pasta `/lib` - Documentação

## 🎯 **VISÃO GERAL**

A pasta `/lib` foi reorganizada para suportar a **migração gradual** do Firebase para Supabase, mantendo compatibilidade e facilitando a transição.

## 📋 **ARQUIVOS PRINCIPAIS**

### **🔧 Configuração e Clientes**

#### **`config.ts`** - Configuração Unificada
```typescript
// Configuração centralizada para todo o projeto
import { CONFIG } from '@/lib/config';

// Acessar configurações
CONFIG.supabase.buckets.public
CONFIG.credits.limits.profile
CONFIG.upload.maxFileSize
```

**Funcionalidades:**
- ✅ Configuração do Supabase e Firebase
- ✅ Limites de créditos por categoria
- ✅ Configurações de upload
- ✅ Validação de configuração
- ✅ URLs e endpoints

#### **`supabaseClient.ts`** - Clientes Supabase
```typescript
// Cliente para uso no browser
import { supabase } from '@/lib/supabaseClient';

// Cliente para uso no servidor
import { supabaseServer } from '@/lib/supabaseClient';

// Cliente service role
import { createServiceClient } from '@/lib/supabaseClient';
```

**Funcionalidades:**
- ✅ Cliente anônimo (browser)
- ✅ Cliente servidor (server-side)
- ✅ Cliente service role (admin)
- ✅ Utilitários de conversão
- ✅ Tipos TypeScript

### **🔄 Migração e Compatibilidade**

#### **`migration-utils.ts`** - Utilitários de Migração
```typescript
import { migrateUsers, migrateImages, checkCompatibility } from '@/lib/migration-utils';

// Migrar usuários
await migrateUsers({ batchSize: 50, dryRun: true });

// Verificar compatibilidade
const status = await checkCompatibility();
```

**Funcionalidades:**
- ✅ Migração de usuários Firebase → Supabase
- ✅ Migração de imagens Firebase Storage → Supabase Storage
- ✅ Verificação de compatibilidade
- ✅ Relatórios de migração
- ✅ Modo dry-run para testes

### **💾 Storage e Upload**

#### **`supabase-storage-secure.ts`** - Storage Seguro (NOVO)
```typescript
import { uploadProfilePhoto, uploadFleetLogo } from '@/lib/supabase-storage-secure';

// Upload com controle de créditos
const result = await uploadProfilePhoto(file, userId, userName, isAdmin);
```

**Funcionalidades:**
- ✅ Upload com sistema de créditos
- ✅ Controle de visibilidade (público/privado)
- ✅ URLs assinadas para conteúdo privado
- ✅ Metadados completos
- ✅ Validação de arquivos

#### **`supabase-storage.ts`** - Storage Básico (LEGADO)
```typescript
import { uploadImage, deleteImage } from '@/lib/supabase-storage';

// Upload básico (sem créditos)
const result = await uploadImage(file, 'bucket-name', 'folder');
```

**Funcionalidades:**
- ✅ Upload básico de imagens
- ✅ Delete de imagens
- ✅ Listagem de arquivos
- ✅ URLs públicas

### **🔥 Firebase (LEGADO)**

#### **`firebase.ts`** - Cliente Firebase
```typescript
import { db, auth, storage } from '@/lib/firebase';

// Usar Firebase (legado)
const usersRef = db.collection('users');
```

#### **`firebase-admin.ts`** - Admin Firebase
```typescript
import { adminDB, adminAuth, adminStorage } from '@/lib/firebase-admin';

// Operações administrativas
const userDoc = await adminDB.collection('users').doc(userId).get();
```

## 🚀 **ESTRATÉGIA DE MIGRAÇÃO**

### **FASE 1: Coexistência (ATUAL)**
- ✅ Firebase e Supabase funcionando simultaneamente
- ✅ Novos uploads vão para Supabase
- ✅ Dados legados permanecem no Firebase
- ✅ Sistema de créditos ativo

### **FASE 2: Migração de Dados**
```typescript
// Migrar usuários
await migrateUsers({ batchSize: 100 });

// Migrar imagens
await migrateImages({ batchSize: 50 });

// Verificar status
const report = await generateMigrationReport();
```

### **FASE 3: Desativação do Firebase**
- 🔄 Migrar todos os dados
- 🔄 Atualizar todas as queries
- 🔄 Remover dependências do Firebase
- 🔄 Manter apenas Supabase

## 📊 **SISTEMA DE CRÉDITOS**

### **Limites Gratuitos:**
```typescript
CONFIG.credits.limits = {
  profile: { free: 1, cost: 5 },    // 1 foto gratuita, 5 créditos adicionais
  fleet: { free: 1, cost: 10 },     // 1 logo gratuito, 10 créditos adicionais
  gallery: { free: 5, cost: 2 },    // 5 imagens gratuitas, 2 créditos cada
  blog: { free: 3, cost: 3 },       // 3 imagens gratuitas, 3 créditos cada
  cityTip: { free: 2, cost: 5 },    // 2 dicas gratuitas, 5 créditos cada
  document: { free: 2, cost: 8 },   // 2 documentos gratuitos, 8 créditos cada
  vehicle: { free: 2, cost: 5 }     // 2 imagens gratuitas, 5 créditos cada
}
```

### **Buckets de Storage:**
```typescript
CONFIG.supabase.buckets = {
  public: 'public-images',      // City tips, blog, logos
  private: 'private-images',    // Fotos de perfil, documentos
  gallery: 'gallery-images'     // Galerias configuráveis
}
```

## 🔐 **SEGURANÇA**

### **Controle de Acesso:**
- ✅ **RLS Policies** no Supabase
- ✅ **URLs assinadas** para conteúdo privado
- ✅ **Verificação de propriedade** antes de operações
- ✅ **Metadados completos** para auditoria

### **Validação de Arquivos:**
```typescript
CONFIG.upload = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  imageQuality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
}
```

## 📝 **EXEMPLOS DE USO**

### **Upload de Foto de Perfil:**
```typescript
import { uploadProfilePhoto } from '@/lib/supabase-storage-secure';

const result = await uploadProfilePhoto(
  file,           // Arquivo
  userId,         // ID do usuário
  userName,       // Nome do usuário
  false           // Não é admin
);

if (result.success) {
  console.log('URL da foto:', result.url);
} else {
  console.error('Erro:', result.error);
}
```

### **Upload de Logo de Frota:**
```typescript
import { uploadFleetLogo } from '@/lib/supabase-storage-secure';

const result = await uploadFleetLogo(
  file,           // Arquivo
  userId,         // ID da frota
  fleetName,      // Nome da frota
  false           // Não é admin
);
```

### **Upload de Galeria:**
```typescript
import { uploadFleetGallery } from '@/lib/supabase-storage-secure';

const results = await uploadFleetGallery(
  files,          // Array de arquivos
  userId,         // ID da frota
  fleetName,      // Nome da frota
  true,           // Público
  false           // Não é admin
);
```

### **Verificar Créditos:**
```typescript
import { getUserCreditStats } from '@/app/actions/secure-storage-actions';

const stats = await getUserCreditStats(userId);
console.log('Créditos disponíveis:', stats.availableCredits);
console.log('Uploads gratuitos restantes:', stats.remainingFree);
```

## 🎯 **PRÓXIMOS PASSOS**

### **1. Configuração (Imediato)**
- [ ] Configurar variáveis de ambiente
- [ ] Executar script SQL no Supabase
- [ ] Testar uploads com créditos

### **2. Migração (Curto Prazo)**
- [ ] Migrar usuários existentes
- [ ] Migrar imagens existentes
- [ ] Verificar integridade dos dados

### **3. Otimização (Médio Prazo)**
- [ ] Implementar cache de imagens
- [ ] Otimizar compressão
- [ ] Adicionar CDN

### **4. Desativação (Longo Prazo)**
- [ ] Remover dependências do Firebase
- [ ] Limpar código legado
- [ ] Documentar nova arquitetura

## ✅ **BENEFÍCIOS DA NOVA ESTRUTURA**

### **Para Desenvolvedores:**
- ✅ **Configuração centralizada** - Um só lugar para configurar tudo
- ✅ **Tipagem forte** - TypeScript em todos os arquivos
- ✅ **Migração gradual** - Sem quebrar funcionalidades existentes
- ✅ **Documentação completa** - Exemplos e guias detalhados

### **Para o Projeto:**
- ✅ **Sustentabilidade financeira** - Sistema de créditos
- ✅ **Segurança robusta** - Múltiplas camadas de proteção
- ✅ **Escalabilidade** - Preparado para crescimento
- ✅ **Manutenibilidade** - Código organizado e documentado

### **Para Usuários:**
- ✅ **Controle de custos** - Limites gratuitos e créditos
- ✅ **Privacidade total** - Controle sobre suas imagens
- ✅ **Performance melhorada** - URLs otimizadas
- ✅ **Experiência consistente** - Interface unificada

**A nova estrutura está pronta para suportar o crescimento do projeto!** 🚀 