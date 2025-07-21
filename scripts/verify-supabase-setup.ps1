# Script de verificação da configuração do Supabase Storage
# Execute este script para verificar se tudo está funcionando

Write-Host "🔍 Verificando configuração do Supabase Storage..." -ForegroundColor Green

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar conexão com o projeto
try {
    $status = supabase status
    Write-Host "✅ Conectado ao projeto Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Não conectado ao projeto" -ForegroundColor Red
    Write-Host "Execute: supabase link --project-ref seu-project-ref" -ForegroundColor Yellow
    exit 1
}

# Listar buckets existentes
Write-Host "📦 Verificando buckets..." -ForegroundColor Cyan
try {
    $buckets = supabase storage list
    Write-Host "✅ Buckets encontrados:" -ForegroundColor Green
    
    if ($buckets -match "public-images") {
        Write-Host "   ✅ public-images (público)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ public-images não encontrado" -ForegroundColor Red
    }
    
    if ($buckets -match "private-images") {
        Write-Host "   ✅ private-images (privado)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ private-images não encontrado" -ForegroundColor Red
    }
    
    if ($buckets -match "gallery-images") {
        Write-Host "   ✅ gallery-images (público)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ gallery-images não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao listar buckets" -ForegroundColor Red
}

# Verificar arquivo SQL
if (Test-Path "supabase-image-metadata.sql") {
    Write-Host "✅ Script SQL encontrado: supabase-image-metadata.sql" -ForegroundColor Green
} else {
    Write-Host "❌ Script SQL não encontrado" -ForegroundColor Red
}

# Verificar arquivo .env.local
if (Test-Path ".env.local") {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local"
    $hasSupabaseUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL"
    $hasAnonKey = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    $hasServiceKey = $envContent -match "SUPABASE_SERVICE_ROLE_KEY"
    
    if ($hasSupabaseUrl) {
        Write-Host "   ✅ NEXT_PUBLIC_SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NEXT_PUBLIC_SUPABASE_URL não configurado" -ForegroundColor Red
    }
    
    if ($hasAnonKey) {
        Write-Host "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado" -ForegroundColor Red
    }
    
    if ($hasServiceKey) {
        Write-Host "   ✅ SUPABASE_SERVICE_ROLE_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SUPABASE_SERVICE_ROLE_KEY não configurado" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Arquivo .env.local não encontrado" -ForegroundColor Red
    Write-Host "Crie o arquivo .env.local com as variáveis do Supabase" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Se algum bucket estiver faltando, execute:" -ForegroundColor Yellow
Write-Host "   supabase storage create public-images --public" -ForegroundColor White
Write-Host "   supabase storage create private-images --private" -ForegroundColor White
Write-Host "   supabase storage create gallery-images --public" -ForegroundColor White
Write-Host ""
Write-Host "2. Execute o script SQL no Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   - Vá para SQL Editor" -ForegroundColor White
Write-Host "   - Cole o conteúdo de supabase-image-metadata.sql" -ForegroundColor White
Write-Host "   - Execute o script" -ForegroundColor White
Write-Host ""
Write-Host "3. Teste o sistema:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   - Teste upload de foto de perfil" -ForegroundColor White
Write-Host "   - Teste upload de logo de frota" -ForegroundColor White
Write-Host "   - Teste upload de galeria" -ForegroundColor White 