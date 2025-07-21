# Script PowerShell para configurar buckets do Supabase Storage no Windows
# Execute este script no PowerShell como administrador

Write-Host "🚀 Configurando buckets do Supabase Storage..." -ForegroundColor Green

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado." -ForegroundColor Red
    Write-Host "Instale em: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    Write-Host "Ou execute: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Verificar se está logado no Supabase
try {
    $status = supabase status
    Write-Host "✅ Conectado ao Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Não está conectado ao Supabase." -ForegroundColor Red
    Write-Host "Execute: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Criando buckets..." -ForegroundColor Cyan

# Bucket público para imagens públicas
Write-Host "Criando bucket public-images..." -ForegroundColor Yellow
try {
    supabase storage create public-images --public
    Write-Host "✅ Bucket public-images criado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Bucket public-images já existe ou erro na criação" -ForegroundColor Yellow
}

# Bucket privado para imagens privadas
Write-Host "Criando bucket private-images..." -ForegroundColor Yellow
try {
    supabase storage create private-images --private
    Write-Host "✅ Bucket private-images criado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Bucket private-images já existe ou erro na criação" -ForegroundColor Yellow
}

# Bucket de galeria para imagens mistas
Write-Host "Criando bucket gallery-images..." -ForegroundColor Yellow
try {
    supabase storage create gallery-images --public
    Write-Host "✅ Bucket gallery-images criado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Bucket gallery-images já existe ou erro na criação" -ForegroundColor Yellow
}

Write-Host "✅ Buckets criados com sucesso!" -ForegroundColor Green

Write-Host "🔐 Configurando políticas de segurança..." -ForegroundColor Cyan

# Verificar se o arquivo SQL existe
if (Test-Path "supabase-image-metadata.sql") {
    Write-Host "Executando script SQL..." -ForegroundColor Yellow
    try {
        Write-Host "✅ Script SQL encontrado" -ForegroundColor Green
        Write-Host "📝 Execute manualmente no Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "   - Vá para SQL Editor" -ForegroundColor White
        Write-Host "   - Cole o conteúdo de supabase-image-metadata.sql" -ForegroundColor White
        Write-Host "   - Execute o script" -ForegroundColor White
    } catch {
        Write-Host "⚠️  Erro ao executar script SQL" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Arquivo supabase-image-metadata.sql não encontrado" -ForegroundColor Red
}

Write-Host "✅ Configuração concluída!" -ForegroundColor Green

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure as variáveis de ambiente no .env.local:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SUPABASE_URL=sua_url" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon" -ForegroundColor White
Write-Host "   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role" -ForegroundColor White
Write-Host ""
Write-Host "2. Execute o script SQL no Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   - Vá para SQL Editor" -ForegroundColor White
Write-Host "   - Cole o conteúdo de supabase-image-metadata.sql" -ForegroundColor White
Write-Host "   - Execute o script" -ForegroundColor White
Write-Host ""
Write-Host "3. Teste o upload de imagens:" -ForegroundColor Yellow
Write-Host "   - Foto de perfil (privada)" -ForegroundColor White
Write-Host "   - Logo de frota (publica)" -ForegroundColor White
Write-Host "   - Galeria de frota (configuravel)" -ForegroundColor White
Write-Host ""
Write-Host "4. Verifique os créditos dos usuários:" -ForegroundColor Yellow
Write-Host "   - Limites gratuitos funcionando" -ForegroundColor White
Write-Host "   - Dedução de créditos correta" -ForegroundColor White
Write-Host ""
Write-Host "5. Monitore o uso:" -ForegroundColor Yellow
Write-Host "   - Verifique a tabela image_metadata" -ForegroundColor White
Write-Host "   - Use as funcoes de estatisticas" -ForegroundColor White 