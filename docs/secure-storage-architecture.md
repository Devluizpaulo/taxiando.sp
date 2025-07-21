# Arquitetura de Storage Seguro - Supabase

## Visão Geral

Este documento descreve a arquitetura de segurança implementada para o sistema de upload e gerenciamento de imagens no Supabase, garantindo a separação adequada entre dados públicos e privados dos usuários.

## 🏗️ Arquitetura de Buckets

### 1. **Bucket Público** (`public-images`)
- **Propósito**: Imagens que devem ser acessíveis a todos os usuários
- **Conteúdo**: 
  - Logos da plataforma
  - Banners e imagens promocionais
  - Imagens de city tips
  - Imagens de blog
- **Acesso**: Público (qualquer pessoa pode visualizar)
- **Limite**: 5MB por arquivo
- **Tipos**: JPG, PNG, WebP, GIF

### 2. **Bucket Privado** (`private-images`)
- **Propósito**: Imagens sensíveis que pertencem aos usuários
- **Conteúdo**:
  - Fotos de perfil
  - Documentos pessoais (CNH, CPF, etc.)
  - Imagens de documentos
- **Acesso**: Privado (apenas o proprietário)
- **Limite**: 10MB por arquivo
- **Tipos**: JPG, PNG, WebP, GIF, PDF

### 3. **Bucket de Galeria** (`gallery-images`)
- **Propósito**: Imagens que podem ser públicas ou privadas
- **Conteúdo**:
  - Galeria de fotos de frotas
  - Logos de empresas
  - Imagens de veículos
  - Galerias de usuários
- **Acesso**: Misto (configurável por imagem)
- **Limite**: 8MB por arquivo
- **Tipos**: JPG, PNG, WebP, GIF

## 🔐 Sistema de Segurança

### Controle de Acesso por Nível

#### **1. Nível de Bucket**
```sql
-- Políticas RLS para cada bucket
CREATE POLICY "Public bucket access" ON storage.objects
FOR SELECT USING (bucket_id = 'public-images');

CREATE POLICY "Private bucket access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'private-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **2. Nível de Metadados**
```sql
-- Tabela image_metadata com RLS
CREATE POLICY "Public images viewable by everyone" ON image_metadata
FOR SELECT USING (is_public = true);

CREATE POLICY "Private images viewable by owner" ON image_metadata
FOR SELECT USING (
  is_public = false AND 
  owner_id = auth.uid()::text
);
```

#### **3. Nível de Aplicação**
- Verificação de permissões antes de cada operação
- URLs assinadas para arquivos privados
- Validação de propriedade antes de deletar/editar

### URLs e Acesso

#### **Imagens Públicas**
```
https://vzcbqtowoousgklffnhi.supabase.co/storage/v1/object/public/public-images/city-tips/123456/image.jpg
```
- Acessível diretamente
- Cacheável por CDN
- Sem expiração

#### **Imagens Privadas**
```
https://vzcbqtowoousgklffnhi.supabase.co/storage/v1/object/sign/private-images/profile-photos/user123/123456/image.jpg?token=...
```
- URL assinada com expiração
- Token único por sessão
- Não cacheável

## 📊 Estrutura de Dados

### Tabela `image_metadata`

```sql
CREATE TABLE image_metadata (
    id UUID PRIMARY KEY,
    url TEXT NOT NULL,                    -- URL de acesso
    name TEXT NOT NULL,                   -- Nome original
    category TEXT NOT NULL,               -- Tipo de imagem
    owner_id TEXT NOT NULL,               -- ID do proprietário
    owner_name TEXT NOT NULL,             -- Nome do proprietário
    is_public BOOLEAN DEFAULT false,      -- Visibilidade
    bucket TEXT NOT NULL,                 -- Bucket de origem
    path TEXT NOT NULL,                   -- Caminho no storage
    size BIGINT NOT NULL,                 -- Tamanho em bytes
    content_type TEXT NOT NULL,           -- Tipo MIME
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Categorias de Imagens

| Categoria | Bucket | Público | Descrição |
|-----------|--------|---------|-----------|
| `profile` | private | ❌ | Fotos de perfil |
| `fleet-logo` | gallery | ✅ | Logos de frotas |
| `fleet-gallery` | gallery | ⚙️ | Galeria de frotas |
| `city-tips` | public | ✅ | Imagens de dicas |
| `blog` | public | ✅ | Imagens de blog |
| `document-cnh` | private | ❌ | Documentos CNH |
| `document-cpf` | private | ❌ | Documentos CPF |
| `vehicle-{id}` | gallery | ✅ | Imagens de veículos |

## 🚀 Implementação

### Funções de Upload

```typescript
// Upload de foto de perfil (sempre privada)
await uploadProfilePhoto(file, userId, userName);

// Upload de logo de frota (sempre pública)
await uploadFleetLogo(file, userId, userName);

// Upload de galeria (configurável)
await uploadFleetGallery(files, userId, userName, isPublic);

// Upload de city tips (sempre pública)
await uploadCityTipImages(files, userId, userName);
```

### Componente de Upload Seguro

```tsx
<SecureImageUpload
  value={imageUrls}
  onChange={setImageUrls}
  bucketType="gallery"
  folder="fleet-gallery"
  ownerId={userId}
  ownerName={userName}
  category="fleet-gallery"
  showVisibilityToggle={true}
  defaultPublic={true}
/>
```

### Gerenciamento de Imagens

```typescript
// Listar imagens do usuário
const userImages = await getUserImages(userId, { 
  bucketType: 'gallery',
  isPublic: true 
});

// Listar imagens públicas
const publicImages = await getPublicImages({ 
  category: 'city-tips',
  limit: 10 
});

// Gerar URL assinada para imagem privada
const signedUrl = await getSignedUrl(imageId, 3600);

// Atualizar visibilidade
await updateImageVisibility(imageId, true, userId);
```

## 🔒 Políticas de Segurança

### 1. **Princípio do Menor Privilégio**
- Usuários só podem acessar suas próprias imagens
- Admins têm acesso limitado a imagens privadas
- URLs assinadas com expiração para arquivos sensíveis

### 2. **Validação em Múltiplas Camadas**
- **Frontend**: Validação de tipos e tamanhos
- **Backend**: Verificação de permissões
- **Database**: Políticas RLS
- **Storage**: Controle de acesso por bucket

### 3. **Auditoria e Rastreamento**
- Todos os uploads são registrados com metadados
- Histórico de alterações de visibilidade
- Logs de acesso a arquivos privados

### 4. **Limpeza Automática**
- URLs assinadas expiram automaticamente
- Função para limpar arquivos órfãos
- Monitoramento de uso de storage

## 📈 Monitoramento

### Estatísticas de Uso

```sql
-- Função para obter estatísticas
SELECT * FROM get_storage_stats();

-- Resultado:
-- bucket_name | total_files | total_size | public_files | private_files
-- public-images | 150 | 52428800 | 150 | 0
-- private-images | 75 | 10485760 | 0 | 75
-- gallery-images | 200 | 83886080 | 180 | 20
```

### Alertas e Limites

- **Limite por usuário**: 100MB total
- **Limite por arquivo**: 10MB máximo
- **Limite de arquivos**: 50 por usuário
- **Alerta**: 80% do limite atingido

## 🛠️ Configuração

### 1. **Criar Buckets no Supabase**

```bash
# Via Supabase CLI
supabase storage create public-images --public
supabase storage create private-images --private
supabase storage create gallery-images --public
```

### 2. **Executar Scripts SQL**

```bash
# Criar tabela de metadados
psql -f supabase-image-metadata.sql

# Criar políticas RLS
psql -f supabase-storage-policies.sql
```

### 3. **Configurar Variáveis de Ambiente**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔄 Migração

### Script de Migração

```typescript
// Migrar imagens existentes do Firebase
import { migrateImagesFromFirebase } from './scripts/migrate-images';

await migrateImagesFromFirebase({
  sourceBucket: 'firebase-bucket',
  targetBucket: 'supabase-bucket',
  preservePrivacy: true
});
```

### Estratégia de Migração

1. **Fase 1**: Migrar imagens públicas
2. **Fase 2**: Migrar imagens de galeria
3. **Fase 3**: Migrar imagens privadas (com permissão)
4. **Fase 4**: Limpeza e validação

## 🚨 Considerações de Segurança

### 1. **Proteção contra Acesso Não Autorizado**
- URLs assinadas com expiração
- Verificação de propriedade em todas as operações
- Políticas RLS em múltiplas camadas

### 2. **Proteção contra Upload Malicioso**
- Validação de tipos MIME
- Verificação de conteúdo de arquivos
- Limitação de tamanho por tipo

### 3. **Proteção de Dados Pessoais**
- Documentos sempre privados
- Fotos de perfil com acesso restrito
- Logs de acesso para auditoria

### 4. **Backup e Recuperação**
- Backup automático do Supabase
- Versionamento de metadados
- Estratégia de recuperação de dados

## 📋 Checklist de Implementação

- [ ] Criar buckets no Supabase
- [ ] Executar scripts SQL
- [ ] Configurar variáveis de ambiente
- [ ] Implementar funções de upload
- [ ] Criar componentes de interface
- [ ] Testar upload de diferentes tipos
- [ ] Validar políticas de segurança
- [ ] Configurar monitoramento
- [ ] Documentar procedimentos
- [ ] Treinar equipe

## 🎯 Benefícios

### Para Usuários
- **Privacidade**: Controle total sobre suas imagens
- **Performance**: URLs otimizadas e cache
- **Flexibilidade**: Configuração de visibilidade

### Para Desenvolvedores
- **Segurança**: Arquitetura robusta e testada
- **Escalabilidade**: Sistema preparado para crescimento
- **Manutenibilidade**: Código organizado e documentado

### Para Administradores
- **Controle**: Visibilidade completa do sistema
- **Auditoria**: Logs detalhados de todas as operações
- **Monitoramento**: Métricas de uso e performance 