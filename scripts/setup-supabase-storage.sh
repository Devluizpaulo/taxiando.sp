#!/bin/bash

# Script para configurar buckets do Supabase Storage
# Execute este script após configurar o Supabase CLI

echo "🚀 Configurando buckets do Supabase Storage..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale em: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Não está conectado ao Supabase. Execute: supabase login"
    exit 1
fi

echo "📦 Criando buckets..."

# Bucket público para imagens públicas
echo "Criando bucket public-images..."
supabase storage create public-images --public

# Bucket privado para imagens privadas
echo "Criando bucket private-images..."
supabase storage create private-images --private

# Bucket de galeria para imagens mistas
echo "Criando bucket gallery-images..."
supabase storage create gallery-images --public

echo "✅ Buckets criados com sucesso!"

echo "🔐 Configurando políticas de segurança..."

# Executar script SQL para criar tabelas e políticas
echo "Executando script SQL..."
psql -f supabase-image-metadata.sql

echo "✅ Configuração concluída!"

echo "
📋 Próximos passos:
1. Configure as variáveis de ambiente no .env.local:
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

2. Teste o upload de imagens:
   - Foto de perfil (privada)
   - Logo de frota (pública)
   - Galeria de frota (configurável)

3. Verifique os créditos dos usuários:
   - Limites gratuitos funcionando
   - Dedução de créditos correta

4. Monitore o uso:
   - Verifique a tabela image_metadata
   - Use as funções de estatísticas
" 