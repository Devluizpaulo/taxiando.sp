# Configuração do Supabase para o Projeto

## Visão Geral

Este projeto foi migrado para usar o Supabase como backend principal, resolvendo problemas de serialização de timestamps do Firebase e fornecendo um sistema robusto de upload de imagens.

## Configuração Inicial

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vzcbqtowoousgklffnhi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2JxdG93b291c2drbGZmbmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzE1MzIsImV4cCI6MjA1OTQwNzUzMn0.T1E1DQol6Ld2mVrarSUoEpqcNwDvKaEWTTbM_YmhDm8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2JxdG93b291c2drbGZmbmhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzgzMTUzMiwiZXhwIjoyMDU5NDA3NTMyfQ.YfD0aBxGBsgKwkcFbKl5USmWea4E4YO0j7z_tOFlOzo
```

### 3. Criar Tabela no Supabase

Execute o script SQL no seu projeto Supabase:

```sql
-- Execute o conteúdo do arquivo supabase-migration.sql
```

Ou use o Supabase CLI:

```bash
supabase db push
```

### 4. Configurar Storage Bucket

No painel do Supabase, vá para Storage e crie um bucket chamado `images` com as seguintes configurações:

- **Nome**: `images`
- **Público**: ✅ Habilitado
- **Política de acesso**: Público para leitura, autenticado para escrita

## Estrutura do Projeto

### Arquivos Criados/Modificados

#### Novos Arquivos:
- `src/lib/supabase-storage.ts` - Funções de upload/download de imagens
- `src/lib/supabaseClient.ts` - Cliente Supabase consolidado (browser e servidor)
- `src/app/actions/supabase-city-guide-actions.ts` - Ações para city tips
- `src/components/ui/image-upload.tsx` - Componente de upload de imagens
- `supabase-migration.sql` - Script de criação da tabela
- `supabase/config.toml` - Configuração do Supabase CLI

#### Arquivos Modificados:
- `src/app/spdicas/page.tsx` - Migrado para Supabase
- `src/app/(dashboard)/admin/city-guide/page.tsx` - Migrado para Supabase
- `src/app/(dashboard)/admin/city-guide/city-guide-client.tsx` - Migrado para Supabase
- `src/app/(dashboard)/admin/city-guide/tip-form.tsx` - Adicionado upload de imagens
- `src/app/page.tsx` - Migrado para Supabase

## Funcionalidades Implementadas

### 1. Upload de Imagens
- Upload direto para Supabase Storage
- Suporte a múltiplas imagens
- Preview em tempo real
- Validação de tipos e tamanhos
- URLs manuais também suportadas

### 2. Sistema de Dicas da Cidade
- CRUD completo via Supabase
- Filtros por público-alvo (motorista/cliente)
- Busca por categoria
- Ordenação por data de criação
- Suporte a URLs de mapa

### 3. Conversão de Timestamps
- Conversão automática de timestamps do Supabase
- Compatibilidade com componentes client
- Formato ISO string para serialização

## Uso das Funções

### Upload de Imagens

```typescript
import { uploadImage } from '@/lib/supabase-storage';

const result = await uploadImage(file, 'images', 'city-tips');
if (result.success) {
  console.log('URL da imagem:', result.url);
}
```

### Gerenciar Dicas

```typescript
import { getTips, createOrUpdateTip, deleteTip } from '@/app/actions/supabase-city-guide-actions';

// Buscar dicas
const tips = await getTips('driver');

// Criar dica
const result = await createOrUpdateTip(tipData);

// Deletar dica
const result = await deleteTip(tipId);
```

### Componente de Upload

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

<ImageUpload
  value={imageUrls}
  onChange={setImageUrls}
  maxImages={5}
  bucket="images"
  folder="city-tips"
/>
```

## Benefícios da Migração

### 1. Resolução de Erros
- ✅ Eliminado erro de serialização de timestamps
- ✅ Compatibilidade total com componentes client
- ✅ Melhor performance de carregamento

### 2. Funcionalidades Avançadas
- ✅ Upload de imagens integrado
- ✅ Storage otimizado
- ✅ Políticas de segurança RLS
- ✅ Backup automático

### 3. Desenvolvimento
- ✅ TypeScript nativo
- ✅ Queries SQL otimizadas
- ✅ Debugging melhorado
- ✅ Documentação completa

## Próximos Passos

### 1. Migração Completa
- Migrar outras entidades para Supabase
- Implementar autenticação Supabase
- Configurar webhooks

### 2. Otimizações
- Implementar cache de imagens
- Adicionar compressão automática
- Configurar CDN

### 3. Monitoramento
- Configurar logs do Supabase
- Implementar métricas
- Monitorar performance

## Troubleshooting

### Erro de Conexão
```bash
# Verificar se o Supabase está rodando
supabase status

# Reiniciar serviços
supabase stop
supabase start
```

### Erro de Upload
- Verificar permissões do bucket
- Confirmar variáveis de ambiente
- Verificar tamanho do arquivo

### Erro de Serialização
- Confirmar que está usando as novas ações
- Verificar conversão de timestamps
- Limpar cache do Next.js

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do Supabase
2. Consultar documentação oficial
3. Verificar configurações de ambiente
4. Testar com dados mínimos 