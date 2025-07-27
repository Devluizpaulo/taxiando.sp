
import * as z from 'zod';

export const cityGuideFormSchema = z.object({
  title: z.string().min(5, "O título é obrigatório."),
  category: z.enum([
    'comer-beber',
    'arte-cultura',
    'pontos-turisticos',
    'vida-noturna',
    'descanso-bemestar',
    'roteiros-batevolta',
    'compras',
    'aventura-natureza',
    'com-criancas',
    'pet-friendly'
  ], { required_error: 'Selecione a categoria.' }),
  description: z.string().min(20, "A descrição é obrigatória."),
  location: z.string().min(3, "A localização é obrigatória."),
  region: z.enum([
    'zona-norte', 'zona-sul', 'zona-leste', 'zona-oeste', 'centro',
    'abc', 'litoral-sul', 'vale-paraiba', 'interior', 'serra-mantiqueira',
    'circuito-aguas', 'litoral-norte', 'oeste-paulista', 'itu-indaiatuba-salto'
  ], { required_error: 'Selecione a região.' }),
  imageUrls: z.array(z.string().url("URL da imagem inválida.")).optional().default([]),
  mapUrl: z.string().url("URL do mapa inválida.").optional().or(z.literal('')),
  target: z.enum(['driver', 'client', 'both'], { required_error: 'Selecione o perfil.' }),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  tags: z.array(z.string()).default([]),
  comment: z.string().max(300).optional(),
  openingHours: z.string().max(100).optional(),
});

export type CityGuideFormValues = z.infer<typeof cityGuideFormSchema>;
