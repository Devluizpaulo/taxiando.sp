# 🤖 Integração com IA Real - Google Gemini via Genkit

## Visão Geral

O sistema de dicas da cidade agora utiliza **IA real** através do **Google Gemini 2.0 Flash** via **Genkit** para detectar automaticamente o tipo de estabelecimento e gerar conteúdo contextualizado.

## 🧠 Como Funciona

### 1. **Detecção Automática de Tipo**
A IA analisa o prompt do usuário e detecta automaticamente o tipo de estabelecimento:

- **🍽️ Gastronomia**: restaurantes, cafés, bares, padarias, etc.
- **🌄 Day Off**: parques, museus, shoppings, cinemas, etc.
- **🛏️ Pousadas/Hotéis**: hospedagem, acomodação, etc.
- **📸 Turismo**: monumentos, atrações, pontos turísticos, etc.
- **✨ Outro**: outras categorias

### 2. **Geração de Campos Específicos**
Baseado no tipo detectado, a IA gera automaticamente:

#### Para Gastronomia:
- Faixa de preço ($, $$, $$$, $$$$)
- Tipo de culinária
- Horário de funcionamento
- Link do cardápio (opcional)

#### Para Day Off:
- Tempo de deslocamento
- Custo estimado total
- Pontos positivos
- Ideal para (relaxar, família, etc.)
- Dica bônus

#### Para Pousadas/Hotéis:
- Tipo de parceria
- Código do cupom
- Preço médio por diária
- Link de reserva
- WhatsApp

#### Para Turismo:
- Melhor horário para visita
- Precisa de ingresso
- Possui guia local
- Nível de acessibilidade

### 3. **Conteúdo Contextualizado**
A IA gera:
- **Título** atrativo e descritivo
- **Descrição** detalhada e envolvente
- **Tags** relevantes para busca
- **Localização** específica

## 🔧 Arquitetura Técnica

### Flow do Genkit
```typescript
// src/ai/flows/generate-city-tip-flow.ts
export async function generateCityTip(input: GenerateCityTipInput): Promise<GenerateCityTipOutput> {
  return generateCityTipFlow(input);
}
```

### Schema de Entrada
```typescript
const GenerateCityTipInputSchema = z.object({
  topic: z.string().describe('Descrição do lugar'),
  target: z.enum(['driver', 'client']).describe('Público-alvo'),
});
```

### Schema de Saída
```typescript
const GenerateCityTipOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  tipType: z.enum(['gastronomia', 'day-off', 'pousada', 'turismo', 'outro']),
  location: z.string(),
  tags: z.array(z.string()),
  specificFields: z.object({
    // Campos específicos por tipo
  }).optional(),
});
```

## 🚀 Como Usar

### 1. **Acessar a IA**
- Clique em "Usar IA Real" na página principal
- A seção de IA será exibida

### 2. **Descrever o Lugar**
- Selecione o público-alvo (Motoristas ou Passageiros)
- Digite uma descrição do lugar
- Use exemplos de prompts fornecidos

### 3. **Gerar Conteúdo**
- Clique em "Gerar com IA"
- A IA processará e detectará automaticamente o tipo
- Campos específicos serão preenchidos

### 4. **Usar os Resultados**
- Revise o conteúdo gerado
- Clique em "Usar Esta Dica" para transferir para o formulário
- Complete os campos restantes se necessário

## 📊 Exemplos de Prompts

### Gastronomia
```
"restaurante japonês barato na zona sul"
"café 24h com estacionamento"
"pizzaria italiana no centro"
```

### Day Off
```
"parque para relaxar no day off"
"shopping com cinema e restaurantes"
"museu de arte moderna"
```

### Pousadas/Hotéis
```
"pousada econômica no litoral"
"hotel com desconto para motoristas"
"resort no interior de SP"
```

### Turismo
```
"monumento histórico no centro"
"igreja antiga na liberdade"
"mirante com vista da cidade"
```

## 🎯 Benefícios da IA Real

### 1. **Precisão**
- Detecção inteligente baseada em contexto
- Análise semântica avançada
- Compreensão de nuances da linguagem

### 2. **Eficiência**
- Preenchimento automático de campos
- Redução de tempo de criação
- Menos erros de classificação

### 3. **Qualidade**
- Conteúdo contextualizado
- Descrições naturais e envolventes
- Tags relevantes e precisas

### 4. **Escalabilidade**
- Processamento rápido
- Capacidade de lidar com diversos tipos
- Aprendizado contínuo

## 🔍 Monitoramento

### Logs de Processamento
```typescript
// Passos visíveis para o usuário:
1. "Conectando com IA do Google Gemini..."
2. "Analisando contexto e palavras-chave..."
3. "Detectando categoria do estabelecimento..."
4. "Gerando campos específicos personalizados..."
5. "Criando descrição contextualizada..."
6. "Finalizando com tags e metadados..."
```

### Tratamento de Erros
- Validação de entrada
- Fallback para tipo "outro" se não conseguir detectar
- Mensagens de erro claras
- Retry automático em caso de falha

## 🛠️ Configuração

### Variáveis de Ambiente
```env
# Google AI API Key
GOOGLE_AI_API_KEY=your_api_key_here
```

### Dependências
```json
{
  "genkit": "^0.1.0",
  "@genkit-ai/googleai": "^0.1.0"
}
```

## 🔮 Próximos Passos

### Melhorias Planejadas
1. **Análise de Imagens**: Detectar tipo baseado em fotos
2. **Sugestões Inteligentes**: Recomendações baseadas em histórico
3. **Otimização de Conteúdo**: Melhorar descrições automaticamente
4. **Integração Multimodal**: Suporte a voz e imagem

### Expansão de Funcionalidades
1. **Tradução Automática**: Suporte a múltiplos idiomas
2. **Personalização**: Adaptar conteúdo ao usuário
3. **Análise de Sentimento**: Detectar tom do conteúdo
4. **Geração de Imagens**: Criar imagens relacionadas

## 📈 Métricas de Performance

### Indicadores de Sucesso
- Taxa de detecção correta de tipo
- Tempo médio de processamento
- Satisfação do usuário
- Qualidade do conteúdo gerado

### Monitoramento
- Logs de uso da IA
- Métricas de erro
- Feedback dos usuários
- Performance da API

---

**Nota**: Esta integração representa um avanço significativo na automação e qualidade do sistema de dicas, proporcionando uma experiência mais inteligente e eficiente para os usuários. 