# 🚀 Guia de Configuração do Supabase Storage

## 📋 **PRÉ-REQUISITOS**

### 1. **Instalar Supabase CLI**
```bash
# Via npm (recomendado)
npm install -g supabase

# Ou via Windows (PowerShell como administrador)
winget install Supabase.CLI
```

### 2. **Fazer Login no Supabase**
```bash
supabase login
```

### 3. **Configurar Projeto**
```bash
# Se você já tem um projeto
supabase link --project-ref seu-project-ref

# Se você precisa criar um novo projeto
# Vá para https://supabase.com e crie um projeto
```

## 🔧 **CONFIGURAÇÃO AUTOMÁTICA (WINDOWS)**

### **Opção 1: Script PowerShell**
```powershell
# Execute no PowerShell como administrador
.\scripts\setup-supabase-storage.ps1
```

### **Opção 2: Comandos Manuais**
```powershell
# Criar buckets
supabase storage create public-images --public
supabase storage create private-images --private
supabase storage create gallery-images --public
```

## 🗄️ **CONFIGURAÇÃO DO BANCO DE DADOS**

### **1. Acessar Supabase Dashboard**
- Vá para https://supabase.com
- Acesse seu projeto
- Clique em "SQL Editor"

### **2. Executar Script SQL**
Copie e cole o conteúdo do arquivo `supabase-image-metadata.sql` no SQL Editor e execute.

### **3. Verificar Tabelas Criadas**
Após executar o script, você deve ver:
- ✅ Tabela `image_metadata`
- ✅ Tabela `user_credits` (se não existir)
- ✅ Políticas RLS configuradas

## 🔐 **CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE**

### **1. Criar/Editar `.env.local`**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Configurações de Storage
NEXT_PUBLIC_STORAGE_URL=https://seu-project-ref.supabase.co/storage/v1
```

### **2. Encontrar as Chaves**
1. Vá para **Settings** > **API** no Supabase Dashboard
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 📦 **CONFIGURAÇÃO DOS BUCKETS**

### **1. Bucket: `public-images`**
- **Tipo**: Público
- **Uso**: City tips, blog posts, logos de frota
- **Acesso**: Qualquer pessoa pode visualizar
- **Upload**: Apenas usuários autenticados

### **2. Bucket: `private-images`**
- **Tipo**: Privado
- **Uso**: Fotos de perfil, documentos
- **Acesso**: Apenas o proprietário
- **Upload**: Apenas o proprietário

### **3. Bucket: `gallery-images`**
- **Tipo**: Público
- **Uso**: Galerias de frota, imagens configuráveis
- **Acesso**: Configurável por imagem
- **Upload**: Apenas usuários autenticados

## 🔍 **VERIFICAÇÃO DA CONFIGURAÇÃO**

### **1. Testar Conexão**
```bash
# Verificar se está conectado
supabase status

# Listar buckets
supabase storage list
```

### **2. Testar Upload (Desenvolvimento)**
1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Teste os uploads:
   - **Foto de perfil**: `/profile`
   - **Logo de frota**: `/fleet/profile`
   - **Galeria**: `/fleet/profile`

### **3. Verificar Logs**
- Vá para **Logs** no Supabase Dashboard
- Verifique se os uploads estão funcionando
- Monitore erros de RLS

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Erro: "Bucket não encontrado"**
```bash
# Verificar buckets existentes
supabase storage list

# Criar bucket se não existir
supabase storage create nome-do-bucket --public
```

### **Erro: "Permissão negada"**
1. Verifique as políticas RLS
2. Confirme se o usuário está autenticado
3. Verifique se as chaves estão corretas

### **Erro: "Créditos insuficientes"**
1. Verifique a tabela `user_credits`
2. Confirme se o usuário tem créditos
3. Teste com um admin (créditos ilimitados)

### **Erro: "URL assinada inválida"**
1. Verifique se o bucket é privado
2. Confirme se a função de geração de URL está correta
3. Verifique a expiração da URL

## 📊 **MONITORAMENTO**

### **1. Estatísticas de Uso**
```sql
-- Verificar uso de créditos
SELECT * FROM user_credits ORDER BY updated_at DESC;

-- Verificar uploads recentes
SELECT * FROM image_metadata ORDER BY created_at DESC LIMIT 10;

-- Estatísticas por bucket
SELECT bucket_name, COUNT(*) as total_images 
FROM image_metadata 
GROUP BY bucket_name;
```

### **2. Alertas Recomendados**
- **Créditos baixos**: Usuários com menos de 5 créditos
- **Uploads falhados**: Erros de upload frequentes
- **Uso excessivo**: Usuários que excedem limites gratuitos

## 🎯 **TESTES FINAIS**

### **Checklist de Verificação**
- [ ] Buckets criados corretamente
- [ ] Tabelas SQL criadas
- [ ] Políticas RLS funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Upload de foto de perfil funcionando
- [ ] Upload de logo de frota funcionando
- [ ] Upload de galeria funcionando
- [ ] Sistema de créditos funcionando
- [ ] URLs assinadas funcionando
- [ ] Logs sem erros

### **Comandos de Teste**
```bash
# Testar conexão
npm run dev

# Verificar build
npm run build

# Testar tipos TypeScript
npx tsc --noEmit
```

## 🎉 **CONFIGURAÇÃO CONCLUÍDA!**

Após seguir todos os passos, seu sistema de storage seguro estará funcionando com:

- ✅ **Segurança total** dos dados dos usuários
- ✅ **Sistema de créditos** funcional
- ✅ **Controle de acesso** em múltiplas camadas
- ✅ **Escalabilidade** para crescimento futuro
- ✅ **Monitoramento** completo do sistema

**O projeto está pronto para produção!** 🚀 