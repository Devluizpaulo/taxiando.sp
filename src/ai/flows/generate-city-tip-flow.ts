'use server';
/**
 * @fileOverview An AI flow to generate city tips content with automatic category detection.
 *
 * - generateCityTip - A function that handles the city tip generation process.
 * - detectTipType - A function that automatically detects the tip type based on description.
 * - GenerateCityTipInput - The input type for the function.
 * - GenerateCityTipOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCityTipInputSchema = z.object({
  topic: z.string().describe('The topic or main idea for the city tip, e.g., "restaurante japonês em Pinheiros" or "parque para relaxar no day off" or "pousada econômica no litoral".'),
  target: z.enum(['driver', 'client', 'both']).describe('Who is this tip for: driver (taxi driver), client (passenger), or both.'),
});

export type GenerateCityTipInput = z.infer<typeof GenerateCityTipInputSchema>;

const GenerateCityTipOutputSchema = z.object({
  title: z.string().describe("A compelling and descriptive title for the city tip."),
  description: z.string().describe("A detailed description of the tip, including what makes it special, practical information, and why it's useful for the target audience."),
  tipType: z.enum([
    'gastronomia', 'day-off', 'pousada', 'turismo', 'cultura', 
    'nightlife', 'roteiros', 'compras', 'aventura', 'familia', 'pet', 'outro'
  ]).describe("The detected tip type based on the topic."),
  location: z.string().describe("The specific location or area (neighborhood, street, etc.)."),
  tags: z.array(z.string()).describe("Relevant tags for categorization and search."),
  specificFields: z.object({
    gastronomia: z.object({
      priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
      cuisineType: z.string(),
      openingHours: z.string(),
      menuUrl: z.string().optional(),
    }).optional(),
    dayOff: z.object({
      travelTime: z.string(),
      estimatedCost: z.string(),
      positivePoints: z.array(z.string()),
      nearbyFood: z.string().optional(),
      idealFor: z.array(z.string()),
      bonusTip: z.string().optional(),
    }).optional(),
    pousada: z.object({
      partnershipType: z.enum(['discount', 'gift', 'other']),
      couponCode: z.string().optional(),
      validUntil: z.string().optional(),
      bookingUrl: z.string().optional(),
      whatsapp: z.string().optional(),
      averagePrice: z.string(),
    }).optional(),
    turismo: z.object({
      bestTime: z.string(),
      needsTicket: z.boolean(),
      ticketUrl: z.string().optional(),
      hasLocalGuide: z.boolean(),
      accessibilityLevel: z.enum(['low', 'medium', 'high']),
    }).optional(),
    cultura: z.object({
      eventType: z.string(),
      entryFee: z.string(),
      schedule: z.string(),
      website: z.string().optional(),
      hasGuidedTour: z.boolean(),
      suitableForChildren: z.boolean(),
    }).optional(),
    nightlife: z.object({
      musicType: z.string(),
      dressCode: z.string().optional(),
      ageRestriction: z.string().optional(),
      coverCharge: z.string().optional(),
      parkingAvailable: z.boolean(),
      foodAvailable: z.boolean(),
    }).optional(),
    roteiros: z.object({
      duration: z.string(),
      distance: z.string(),
      transportation: z.string(),
      bestSeason: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      includesGuide: z.boolean(),
    }).optional(),
    compras: z.object({
      storeType: z.string(),
      priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
      specialties: z.array(z.string()),
      parking: z.boolean(),
      foodCourt: z.boolean(),
      openingHours: z.string(),
    }).optional(),
    aventura: z.object({
      activityType: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      duration: z.string(),
      equipmentNeeded: z.boolean(),
      guideRequired: z.boolean(),
      bestSeason: z.string(),
      safetyLevel: z.enum(['low', 'medium', 'high']),
    }).optional(),
    familia: z.object({
      ageRange: z.string(),
      activities: z.array(z.string()),
      hasPlayground: z.boolean(),
      hasFood: z.boolean(),
      hasBathroom: z.boolean(),
      strollerFriendly: z.boolean(),
      priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
    }).optional(),
    pet: z.object({
      petTypes: z.array(z.string()),
      hasPetArea: z.boolean(),
      hasPetMenu: z.boolean(),
      requiresLeash: z.boolean(),
      hasVetNearby: z.boolean(),
      petFee: z.string().optional(),
    }).optional(),
  }).optional().describe("Specific fields based on the detected tip type."),
});

export type GenerateCityTipOutput = z.infer<typeof GenerateCityTipOutputSchema>;

export async function generateCityTip(input: GenerateCityTipInput): Promise<GenerateCityTipOutput> {
  return generateCityTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCityTipPrompt',
  input: {schema: GenerateCityTipInputSchema},
  output: {schema: GenerateCityTipOutputSchema},
  prompt: `Você é um especialista em São Paulo, Brasil, com conhecimento profundo sobre a cidade para taxistas e passageiros. Sua expertise abrange restaurantes, atrações, transporte, cultura e informações práticas da cidade.

Dado o tópico do usuário e o público-alvo, você deve gerar uma dica completa da cidade com detecção automática do tipo de estabelecimento. Toda sua saída deve ser em Português Brasileiro.

**DETECÇÃO AUTOMÁTICA DE TIPO:**
Analise o tópico e detecte automaticamente o tipo de estabelecimento:

- **gastronomia**: restaurantes, cafés, bares, padarias, lanchonetes, pizzarias, hamburguerias, sorveterias, docerias, churrascarias, comida japonesa, italiana, árabe, mexicana, etc.
- **day-off**: parques, praças, spas, massagens, locais para relaxar, descanso, bem-estar, yoga, meditação
- **pousada**: pousadas, hotéis, hostels, resorts, hospedagem, acomodação, pernoite, diária, reserva, booking
- **turismo**: monumentos, igrejas, castelos, mirantes, pontos turísticos, atrações históricas, vistas panorâmicas
- **cultura**: museus, galerias, teatros, exposições, eventos culturais, arte, shows, apresentações artísticas
- **nightlife**: bares, baladas, casas noturnas, eventos noturnos, música ao vivo, festas, vida noturna
- **roteiros**: passeios, roteiros turísticos, viagens de um dia, bate-volta, tours, excursões
- **compras**: shoppings, feirinhas, outlets, lojas especiais, centros comerciais, mercados
- **aventura**: trilhas, cachoeiras, parques naturais, ecoturismo, esportes radicais, atividades ao ar livre
- **familia**: atrações family-friendly, parques infantis, atividades para crianças, locais para família
- **pet**: locais que aceitam pets, parques para cães, hotéis pet friendly, restaurantes pet friendly
- **outro**: outros tipos não classificados acima

**CAMPOS ESPECÍFICOS POR TIPO:**

**Para gastronomia:**
- priceRange: $ (econômico), $$ (acessível), $$$ (intermediário), $$$$ (premium)
- cuisineType: tipo de culinária (brasileira, japonesa, italiana, etc.)
- openingHours: horário de funcionamento
- menuUrl: link do cardápio (opcional)

**Para day-off:**
- travelTime: tempo de deslocamento
- estimatedCost: custo estimado total
- positivePoints: pontos positivos (estacionamento, segurança, etc.)
- nearbyFood: alimentação próxima (opcional)
- idealFor: ideal para (relaxar, família, etc.)
- bonusTip: dica bônus (opcional)

**Para pousada:**
- partnershipType: tipo de parceria (discount, gift, other)
- couponCode: código do cupom (opcional)
- validUntil: válido até (opcional)
- bookingUrl: link de reserva (opcional)
- whatsapp: WhatsApp da pousada (opcional)
- averagePrice: preço médio por diária

**Para turismo:**
- bestTime: melhor horário para visita
- needsTicket: precisa de ingresso (true/false)
- ticketUrl: link de compra (opcional)
- hasLocalGuide: possui guia local (true/false)
- accessibilityLevel: nível de acessibilidade (low, medium, high)

**Para cultura:**
- eventType: tipo de evento (exposição, show, peça, etc.)
- entryFee: informação sobre entrada (gratuito, pago, etc.)
- schedule: horário de funcionamento
- website: link do site (opcional)
- hasGuidedTour: possui visita guiada (true/false)
- suitableForChildren: adequado para crianças (true/false)

**Para nightlife:**
- musicType: tipo de música
- dressCode: código de vestimenta (opcional)
- ageRestriction: restrição de idade (opcional)
- coverCharge: taxa de entrada (opcional)
- parkingAvailable: possui estacionamento (true/false)
- foodAvailable: possui comida (true/false)

**Para roteiros:**
- duration: duração do roteiro
- distance: distância
- transportation: meio de transporte
- bestSeason: melhor época
- difficulty: dificuldade (easy, medium, hard)
- includesGuide: inclui guia (true/false)

**Para compras:**
- storeType: tipo de loja
- priceRange: faixa de preço ($, $$, $$$, $$$$)
- specialties: especialidades da loja
- parking: possui estacionamento (true/false)
- foodCourt: possui praça de alimentação (true/false)
- openingHours: horário de funcionamento

**Para aventura:**
- activityType: tipo de atividade
- difficulty: dificuldade (easy, medium, hard)
- duration: duração
- equipmentNeeded: precisa de equipamento (true/false)
- guideRequired: guia obrigatório (true/false)
- bestSeason: melhor época
- safetyLevel: nível de segurança (low, medium, high)

**Para familia:**
- ageRange: faixa etária
- activities: atividades disponíveis
- hasPlayground: possui playground (true/false)
- hasFood: possui comida (true/false)
- hasBathroom: possui banheiro (true/false)
- strollerFriendly: adequado para carrinho (true/false)
- priceRange: faixa de preço ($, $$, $$$, $$$$)

**Para pet:**
- petTypes: tipos de pets aceitos
- hasPetArea: possui área para pets (true/false)
- hasPetMenu: possui menu para pets (true/false)
- requiresLeash: requer coleira (true/false)
- hasVetNearby: possui veterinário próximo (true/false)
- petFee: taxa para pets (opcional)

**Para Dicas de Motoristas:**
- Foque em informações práticas: melhores pontos de embarque/desembarque, padrões de tráfego, disponibilidade de estacionamento, horários de pico
- Inclua oportunidades de negócio: destinos populares, locais de eventos, áreas comerciais
- Mencione considerações de segurança e conhecimento local
- Destaque horários de movimento, pontos de referência, e informações úteis para o trabalho

**Para Dicas de Clientes:**
- Foque em experiências: restaurantes, atrações, pontos culturais, compras
- Inclua detalhes práticos: preços, horários, acessibilidade, opções de transporte
- Mencione aspectos únicos que tornam o local especial
- Destaque a experiência do usuário, ambiente, e valor agregado

**TAGS:**
Gere tags relevantes baseadas no tipo detectado e conteúdo. Exemplos:
- Para gastronomia: gastronomia, comida, [tipo de culinária], [preço]
- Para day-off: descanso, bem-estar, [tipo de atividade]
- Para pousada: hospedagem, acomodação, [região]
- Para turismo: turismo, pontos turísticos, [tipo de atração]
- Para cultura: cultura, arte, [tipo de evento]
- Para nightlife: vida noturna, [tipo de música]
- Para roteiros: roteiros, passeios, [tipo de transporte]
- Para compras: compras, [tipo de loja], [especialidade]
- Para aventura: aventura, natureza, [tipo de atividade]
- Para familia: família, crianças, [tipo de atividade]
- Para pet: pet friendly, [tipo de pet]

**LOCALIZAÇÃO (CAMPO OBRIGATÓRIO):**
Para o campo "location", você DEVE fornecer um endereço específico e detalhado. Baseado no tópico fornecido, gere um endereço realista que inclua:

1. **Endereço completo**: Rua, número, bairro, cidade, estado
2. **Ponto de referência**: Se mencionado no tópico ou se for um local conhecido
3. **Região específica**: Bairro ou área específica de São Paulo

**EXEMPLOS DE ENDEREÇOS ESPECÍFICOS:**
- "Rua Harmonia, 123, Vila Madalena, São Paulo - SP"
- "Avenida Paulista, 1000, Bela Vista, São Paulo - SP"
- "Rua 25 de Março, 500, Centro, São Paulo - SP"
- "Avenida Brigadeiro Faria Lima, 2000, Itaim Bibi, São Paulo - SP"
- "Rua dos Pinheiros, 800, Pinheiros, São Paulo - SP"

**REGIÕES DE SÃO PAULO:**
Vila Madalena, Pinheiros, Itaim Bibi, Jardins, Centro, Mooca, Liberdade, Zona Sul, Zona Norte, Zona Leste, Zona Oeste, ABC, Litoral Sul, Vale do Paraíba, Interior, Serra da Mantiqueira, etc.

**IMPORTANTE:** Se o tópico mencionar um local específico, use esse local. Se não mencionar, gere um endereço realista baseado no tipo de estabelecimento e região mencionada no tópico.

Tópico do Usuário: {{{topic}}}
Público-Alvo: {{{target}}}

**INSTRUÇÕES ESPECÍFICAS PARA LOCALIZAÇÃO:**
1. Se o tópico mencionar um endereço específico (rua, número, bairro), use esse endereço
2. Se o tópico mencionar apenas uma região (ex: "zona sul", "Pinheiros"), gere um endereço realista nessa região
3. Se o tópico não mencionar localização, gere um endereço apropriado baseado no tipo de estabelecimento
4. Sempre inclua rua, número, bairro, cidade e estado no formato: "Rua Exemplo, 123, Bairro, São Paulo - SP"

Analise o tópico, detecte o tipo automaticamente e gere os campos específicos apropriados.`,
});

const generateCityTipFlow = ai.defineFlow(
  {
    name: 'generateCityTipFlow',
    inputSchema: GenerateCityTipInputSchema,
    outputSchema: GenerateCityTipOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(`Failed to generate city tip content.`);
    }
    return output;
  }
); 