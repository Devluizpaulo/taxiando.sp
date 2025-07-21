-- Criação da tabela de metadados de imagens
CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    size BIGINT NOT NULL,
    content_type TEXT NOT NULL,
    credits_used INTEGER DEFAULT 0,
    uploaded_by TEXT NOT NULL CHECK (uploaded_by IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_owner_id ON image_metadata(owner_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_is_public ON image_metadata(is_public);
CREATE INDEX IF NOT EXISTS idx_image_metadata_category ON image_metadata(category);
CREATE INDEX IF NOT EXISTS idx_image_metadata_bucket ON image_metadata(bucket);
CREATE INDEX IF NOT EXISTS idx_image_metadata_created_at ON image_metadata(created_at DESC);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_image_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_image_metadata_updated_at 
    BEFORE UPDATE ON image_metadata 
    FOR EACH ROW 
    EXECUTE FUNCTION update_image_metadata_updated_at();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Política para leitura de imagens públicas
CREATE POLICY "Public images are viewable by everyone" ON image_metadata
    FOR SELECT USING (is_public = true);

-- Política para leitura de imagens privadas (apenas pelo dono)
CREATE POLICY "Private images are viewable by owner" ON image_metadata
    FOR SELECT USING (
        is_public = false AND 
        owner_id = auth.uid()::text
    );

-- Política para inserção (apenas usuários autenticados)
CREATE POLICY "Images are insertable by authenticated users" ON image_metadata
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (apenas pelo dono ou admin)
CREATE POLICY "Images are updatable by owner" ON image_metadata
    FOR UPDATE USING (
        owner_id = auth.uid()::text OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Política para deleção (apenas pelo dono ou admin)
CREATE POLICY "Images are deletable by owner" ON image_metadata
    FOR DELETE USING (
        owner_id = auth.uid()::text OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Comentários para documentação
COMMENT ON TABLE image_metadata IS 'Metadados de imagens armazenadas no Supabase Storage';
COMMENT ON COLUMN image_metadata.id IS 'ID único da imagem';
COMMENT ON COLUMN image_metadata.url IS 'URL de acesso à imagem (pública ou assinada)';
COMMENT ON COLUMN image_metadata.name IS 'Nome original do arquivo';
COMMENT ON COLUMN image_metadata.category IS 'Categoria da imagem (profile, gallery, city-tips, etc.)';
COMMENT ON COLUMN image_metadata.owner_id IS 'ID do usuário proprietário da imagem';
COMMENT ON COLUMN image_metadata.owner_name IS 'Nome do usuário proprietário';
COMMENT ON COLUMN image_metadata.is_public IS 'Se a imagem é pública ou privada';
COMMENT ON COLUMN image_metadata.bucket IS 'Nome do bucket no Supabase Storage';
COMMENT ON COLUMN image_metadata.path IS 'Caminho do arquivo no bucket';
COMMENT ON COLUMN image_metadata.size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN image_metadata.content_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN image_metadata.created_at IS 'Data de criação';
COMMENT ON COLUMN image_metadata.updated_at IS 'Data da última atualização';

-- Função para limpar imagens órfãs (sem metadados)
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
DECLARE
    bucket_name TEXT;
    file_path TEXT;
BEGIN
    -- Esta função pode ser chamada periodicamente para limpar arquivos órfãos
    -- Por enquanto, apenas um placeholder
    RAISE NOTICE 'Função de limpeza de imagens órfãs chamada';
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de uso de storage
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
    bucket_name TEXT,
    total_files BIGINT,
    total_size BIGINT,
    public_files BIGINT,
    private_files BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        im.bucket,
        COUNT(*) as total_files,
        SUM(im.size) as total_size,
        COUNT(*) FILTER (WHERE im.is_public = true) as public_files,
        COUNT(*) FILTER (WHERE im.is_public = false) as private_files
    FROM image_metadata im
    GROUP BY im.bucket;
END;
$$ LANGUAGE plpgsql; 