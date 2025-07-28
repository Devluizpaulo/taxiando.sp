# Sistema de Dicas Dinâmico - City Guide

## 🧠 **Visão Geral**

Sistema inteligente de cadastro de dicas que se adapta automaticamente ao tipo de lugar selecionado, permitindo a inclusão de informações genéricas ou específicas por categoria. O sistema utiliza IA para detectar automaticamente o tipo de estabelecimento e preencher campos específicos.

## 🏗️ **Arquitetura**

### **Tipos de Dica**
- **🍽️ Gastronomia**: Restaurantes, cafés, bares, padarias
- **🌄 Day Off**: Roteiros de descanso e lazer
- **🛏️ Pousadas/Hotéis**: Hospedagem com parcerias
- **📸 Turismo**: Pontos turísticos e atrações
- **✨ Outro**: Outras categorias

### **Estrutura de Dados**
```typescript
interface CityTip {
  id: string;
  title: string;
  description: string;
  location: string;
  region: string;
  imageUrls: string[];
  mapUrl?: string;
  target: 'driver' | 'client' | 'both';
  tags: string[];
  comment?: string;
  tipType: 'gastronomia' | 'day-off' | 'pousada' | 'turismo' | 'outro';
  
  // Campos específicos por categoria (condicionais)
  gastronomia?: {
    priceRange: '$' | '$$' | '$$$' | '$$$$';
    cuisineType: string;
    openingHours: string;
    menuUrl?: string;
  };
  dayOff?: {
    travelTime: string;
    estimatedCost: string;
    positivePoints: string[];
    nearbyFood?: string;
    idealFor: string[];
    bonusTip?: string;
  };
  pousada?: {
    partnershipType: 'discount' | 'gift' | 'other';
    couponCode?: string;
    validUntil?: string;
    bookingUrl?: string;
    whatsapp?: string;
    averagePrice: string;
  };
  turismo?: {
    bestTime: string;
    needsTicket: boolean;
    ticketUrl?: string;
    hasLocalGuide: boolean;
    accessibilityLevel: 'low' | 'medium' | 'high';
  };
  
  contributorName?: string;
  status: 'draft' | 'published' | 'pending';
  createdAt: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
}
```

## 🧾 **Campos por Categoria**

### **Campos Genéricos (Todas as Categorias)**
- `title`: Nome do local
- `description`: Descrição curta
- `location`: Localização/endereço
- `region`: Região de SP ou região vizinha
- `imageUrls`: Imagens do local
- `target`: Para quem é a dica (Motorista/Passageiro/Ambos)
- `tags`: Tags para categorização
- `comment`: Opinião sincera (opcional)
- `mapUrl`: Link do Google Maps (opcional)
- `contributorName`: Nome do colaborador (opcional)

### **🍽️ Gastronomia**
- `priceRange`: Faixa de preço ($, $$, $$$, $$$$)
- `cuisineType`: Tipo de culinária (brasileira, japonesa, etc.)
- `openingHours`: Horário de funcionamento
- `menuUrl`: Link de cardápio online (opcional)

### **🌄 Day Off**
- `travelTime`: Tempo de deslocamento
- `estimatedCost`: Gasto estimado total
- `positivePoints`: Pontos positivos (estacionamento, segurança, etc.)
- `nearbyFood`: Alimentação próxima (opcional)
- `idealFor`: Ideal para (relaxar, família, etc.)
- `bonusTip`: Dica bônus (opcional)

### **🛏️ Pousadas/Hotéis**
- `partnershipType`: Tipo de parceria (desconto, brinde, outro)
- `couponCode`: Código do cupom (opcional)
- `validUntil`: Válido até (opcional)
- `bookingUrl`: Link de reserva (opcional)
- `whatsapp`: WhatsApp da pousada (opcional)
- `averagePrice`: Preço médio por diária

### **📸 Turismo**
- `bestTime`: Melhor horário para visita
- `needsTicket`: Precisa de ingresso? (sim/não)
- `ticketUrl`: Link de compra (opcional)
- `hasLocalGuide`: Possui guia local? (sim/não)
- `accessibilityLevel`: Nível de acessibilidade (baixo, médio, alto)

## 🧠 **IA Inteligente - Detecção Automática**

### **Funcionalidades da IA**
- **Detecção Automática de Tipo**: Analisa palavras-chave no prompt para identificar o tipo de estabelecimento
- **Preenchimento Inteligente**: Preenche automaticamente campos específicos baseado no tipo detectado
- **Geração Contextualizada**: Cria títulos e descrições relevantes para o público-alvo
- **Tags Automáticas**: Gera tags relevantes baseadas no conteúdo

### **Palavras-chave de Detecção**
```typescript
const gastronomiaKeywords = [
  'restaurante', 'café', 'bar', 'padaria', 'lanchonete', 'pizzaria', 
  'hamburgueria', 'sorveteria', 'doceria', 'churrascaria', 'japonês', 
  'chinês', 'italiano', 'árabe', 'mexicano', 'comida', 'almoço', 'jantar', 'lanche'
];

const dayOffKeywords = [
  'parque', 'praça', 'museu', 'shopping', 'cinema', 'teatro', 'spa', 
  'massagem', 'trilha', 'cachoeira', 'passeio', 'day off', 'descanso', 
  'lazer', 'recreação', 'diversão'
];

const pousadaKeywords = [
  'pousada', 'hotel', 'hostel', 'resort', 'hospedagem', 'acomodação', 
  'pernoite', 'diária', 'reserva', 'booking'
];

const turismoKeywords = [
  'turístico', 'monumento', 'igreja', 'castelo', 'mirante', 'atração', 
  'ponto turístico', 'histórico', 'cultural', 'arte', 'exposição', 'galeria'
];
```

### **Exemplos de Prompts Inteligentes**
- **Gastronomia**: "restaurante japonês barato na zona sul", "café 24h com estacionamento"
- **Day Off**: "parque para relaxar no day off", "shopping com cinema e restaurantes"
- **Pousada**: "pousada econômica no litoral", "hotel com desconto para motoristas"
- **Turismo**: "monumento histórico no centro", "museu de arte moderna"

## 🎨 **Interface do Usuário**

### **Formulário Dinâmico**
- **Seção de IA Inteligente**: Campo para descrição do lugar com detecção automática
- **Seleção Visual de Tipo**: Cards com ícones para escolha do tipo de dica
- **Abas Organizadas**: 
  - Informações Básicas
  - Campos Específicos (dinâmicos)
  - Mídia & Links
- **Animações Suaves**: Transições com Framer Motion
- **Feedback Visual**: Confetti e toasts para sucesso

### **Sistema de Status**
- **Rascunho**: Dica salva mas não publicada
- **Publicado**: Dica visível para todos
- **Pendente**: Aguardando moderação

### **Prompts Inteligentes**
- Exemplos organizados por categoria
- Clique para preencher automaticamente
- Sugestões contextuais baseadas no público-alvo

## ⚡ **Funcionalidades**

### **Filtros e Busca**
- Por tipo de dica
- Por região
- Por público-alvo (motorista/cliente)
- Por status (publicado/rascunho)
- Busca por texto

### **Sistema de Avaliação**
- Avaliação por estrelas (0-5)
- Comentários dos usuários
- Média de avaliação
- Contador de reviews

### **Links Específicos**
- **Gastronomia**: Link do cardápio
- **Pousada**: Link de reserva, WhatsApp
- **Turismo**: Link de compra de ingressos
- **Todos**: Link do Google Maps

### **Gestão de Status**
- Publicar/despublicar dicas
- Moderação automática/manual
- Sistema de rascunhos

## 🚀 **Como Usar**

### **Criando uma Dica**
1. **Usar IA Inteligente**:
   - Selecione o público-alvo
   - Digite a descrição do lugar
   - Clique em "Gerar" para detecção automática
   - A IA preencherá automaticamente os campos específicos

2. **Preenchimento Manual**:
   - Selecione o tipo de dica
   - Preencha os campos básicos
   - Complete os campos específicos que aparecem
   - Adicione imagens e links

3. **Salvar**:
   - Salvar como rascunho
   - Publicar diretamente

### **Editando uma Dica**
- Acesse a lista de dicas
- Clique em "Editar"
- Modifique os campos necessários
- Salve as alterações

### **Gerenciando Status**
- Visualize dicas por status
- Publique rascunhos
- Despublique dicas ativas
- Exclua dicas desnecessárias

## 💡 **Benefícios**

### **Para Usuários**
- **Usabilidade**: Interface intuitiva e responsiva
- **Relevância**: Conteúdo específico por categoria
- **Eficiência**: IA preenche automaticamente campos
- **Organização**: Estrutura clara e organizada

### **Para Parceiros**
- **Visibilidade**: Destaque para estabelecimentos parceiros
- **Engajamento**: Sistema de cupons e descontos
- **Feedback**: Avaliações e comentários
- **Promoção**: Links diretos para reservas

### **Para Administradores**
- **Moderação**: Controle de qualidade do conteúdo
- **Analytics**: Métricas de engajamento
- **Flexibilidade**: Sistema adaptável a novos tipos
- **Escalabilidade**: Suporte a múltiplas regiões

## 🔮 **Funcionalidades Futuras**

### **Sistema de Ranking**
- Mais salvas
- Mais acessadas
- Melhor avaliadas
- Trending

### **IA Avançada**
- Geração de imagens com IA
- Análise de sentimento em reviews
- Recomendações personalizadas
- Tradução automática

### **Integrações**
- Google Places API
- TripAdvisor
- Booking.com
- WhatsApp Business

### **Recursos Sociais**
- Compartilhamento em redes sociais
- Sistema de favoritos
- Comentários e respostas
- Gamificação (badges, pontos)

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- **Next.js 14**: Framework React
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Framer Motion**: Animações
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

### **Backend**
- **Firebase Firestore**: Banco de dados
- **Firebase Storage**: Armazenamento de imagens
- **Next.js Server Actions**: API routes

### **UI Components**
- **shadcn/ui**: Componentes base
- **Lucide React**: Ícones
- **Canvas Confetti**: Efeitos visuais

### **IA e Automação**
- **Detecção de Palavras-chave**: Algoritmo customizado
- **Geração de Conteúdo**: Lógica inteligente
- **Validação Condicional**: Schemas dinâmicos

## 📊 **Estrutura de Arquivos**

```
src/
├── app/
│   ├── (dashboard)/admin/city-guide/
│   │   ├── tip-form.tsx          # Formulário principal
│   │   ├── city-guide-client.tsx # Lista de dicas
│   │   └── page.tsx              # Página admin
│   └── actions/
│       └── city-guide-actions.ts # Server actions
├── components/
│   ├── city-tip-card.tsx         # Card de exibição
│   └── ai-tip-generator-demo.tsx # Demo da IA
├── lib/
│   ├── city-guide-schemas.ts     # Schemas Zod
│   └── types.ts                  # Tipos TypeScript
└── docs/
    └── city-guide-system.md      # Esta documentação
```

## 🎯 **Exemplos de Uso**

### **Exemplo 1: Restaurante Japonês**
```
Prompt: "restaurante japonês barato na zona sul"
IA Detecta: Gastronomia
Campos Preenchidos:
- Tipo: Gastronomia
- Faixa de Preço: $ (Econômico)
- Culinária: Japonesa
- Horário: Seg a Sex 11h-23h, Sáb e Dom 12h-00h
- Tags: gastronomia, comida, japonês, barato
```

### **Exemplo 2: Parque para Day Off**
```
Prompt: "parque para relaxar no day off"
IA Detecta: Day Off
Campos Preenchidos:
- Tipo: Day Off
- Tempo de Deslocamento: 30-45 min de carro
- Custo: R$ 50-100 por pessoa
- Pontos Positivos: Ar livre, Gratuito, Bom para crianças
- Ideal Para: Relaxar, Descansar, Fazer exercícios
```

### **Exemplo 3: Pousada no Litoral**
```
Prompt: "pousada econômica no litoral"
IA Detecta: Pousada
Campos Preenchidos:
- Tipo: Pousada
- Parceria: Desconto
- Preço: R$ 200-350 por diária
- Tags: hospedagem, acomodação, litoral
```

Este sistema oferece uma experiência completa e inteligente para criação e gestão de dicas da cidade, com foco na usabilidade e relevância do conteúdo. 