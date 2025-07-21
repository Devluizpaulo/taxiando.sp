'use server';
/**
 * @fileOverview An AI flow to generate city tips content.
 *
 * - generateCityTip - A function that handles the city tip generation process.
 * - GenerateCityTipInput - The input type for the function.
 * - GenerateCityTipOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCityTipInputSchema = z.object({
  topic: z.string().describe('The topic or main idea for the city tip, e.g., "restaurante japonês em Pinheiros" or "estacionamento gratuito no centro" or "ponto de táxi movimentado na Paulista".'),
  target: z.enum(['driver', 'client']).describe('Who is this tip for: driver (taxi driver) or client (passenger).'),
  category: z.string().optional().describe('Optional category like "Gastronomia", "Lazer", "Transporte", "Cultura".'),
});
export type GenerateCityTipInput = z.infer<typeof GenerateCityTipInputSchema>;

const GenerateCityTipOutputSchema = z.object({
  title: z.string().describe("A compelling and descriptive title for the city tip."),
  description: z.string().describe("A detailed description of the tip, including what makes it special, practical information, and why it's useful for the target audience."),
  category: z.string().describe("The most appropriate category for this tip."),
  location: z.string().describe("The specific location or area (neighborhood, street, etc.)."),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional().describe("Price range for client tips (only if relevant)."),
  mapUrl: z.string().optional().describe("Optional Google Maps URL if a specific location is mentioned."),
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

Dado o tópico do usuário e o público-alvo, você deve gerar uma dica completa da cidade. Toda sua saída deve ser em Português Brasileiro.

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

A saída deve ser estruturada de acordo com o schema:
- O 'title' deve ser atrativo e descritivo
- A 'description' deve ser informativa e envolvente, fornecendo valor real
- A 'category' deve ser a classificação mais apropriada
- A 'location' deve ser específica e útil para navegação
- O 'priceRange' deve ser incluído apenas para dicas de clientes quando relevante
- O 'mapUrl' deve ser incluído se um negócio ou local específico for mencionado

**Exemplos de categorias:** Gastronomia, Lazer, Cultura, Transporte, Compras, Saúde, Educação, Negócios, Entretenimento, Esportes

**Exemplos de localizações:** Vila Madalena, Pinheiros, Itaim Bibi, Jardins, Centro, Mooca, Liberdade, etc.

Tópico do Usuário: {{{topic}}}
Público-Alvo: {{{target}}}
Categoria: {{{category}}}`,
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