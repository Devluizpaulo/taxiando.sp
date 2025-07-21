-- Criação da tabela city_tips
CREATE TABLE IF NOT EXISTS city_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    map_url TEXT,
    target TEXT NOT NULL CHECK (target IN ('driver', 'client')),
    price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_city_tips_target ON city_tips(target);
CREATE INDEX IF NOT EXISTS idx_city_tips_category ON city_tips(category);
CREATE INDEX IF NOT EXISTS idx_city_tips_created_at ON city_tips(created_at DESC);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_city_tips_updated_at 
    BEFORE UPDATE ON city_tips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE city_tips ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "City tips are viewable by everyone" ON city_tips
    FOR SELECT USING (true);

-- Política para inserção/atualização/deleção apenas por admins
-- Pré-requisito: Tabela 'users' com colunas 'id' (auth.uid()) e 'role'
DROP POLICY IF EXISTS "City tips are insertable by authenticated users" ON city_tips;
CREATE POLICY "Admins can insert new city tips" ON city_tips
    FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "City tips are updatable by authenticated users" ON city_tips;
CREATE POLICY "Admins can update city tips" ON city_tips
    FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "City tips are deletable by authenticated users" ON city_tips;
CREATE POLICY "Admins can delete city tips" ON city_tips
    FOR DELETE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Comentários para documentação
COMMENT ON TABLE city_tips IS 'Dicas da cidade para motoristas e clientes';
COMMENT ON COLUMN city_tips.id IS 'ID único da dica';
COMMENT ON COLUMN city_tips.title IS 'Título da dica';
COMMENT ON COLUMN city_tips.category IS 'Categoria da dica (ex: Gastronomia, Lazer, Cultura)';
COMMENT ON COLUMN city_tips.description IS 'Descrição detalhada da dica';
COMMENT ON COLUMN city_tips.location IS 'Localização da dica';
COMMENT ON COLUMN city_tips.image_urls IS 'Array de URLs das imagens';
COMMENT ON COLUMN city_tips.map_url IS 'URL do mapa (opcional)';
COMMENT ON COLUMN city_tips.target IS 'Público-alvo: driver (motorista) ou client (cliente)';
COMMENT ON COLUMN city_tips.price_range IS 'Faixa de preço para dicas de clientes';
COMMENT ON COLUMN city_tips.created_at IS 'Data de criação';
COMMENT ON COLUMN city_tips.updated_at IS 'Data da última atualização'; 