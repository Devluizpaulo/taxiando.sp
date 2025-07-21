
import * as z from 'zod';

export const cityGuideFormSchema = z.object({
  title: z.string().min(5, "O título é obrigatório."),
  category: z.string().min(3, "A categoria é obrigatória."),
  description: z.string().min(20, "A descrição é obrigatória."),
  location: z.string().min(3, "A localização é obrigatória."),
  imageUrls: z.array(z.string().url("URL da imagem inválida.")).optional().default([]),
  mapUrl: z.string().url("URL do mapa inválida.").optional().or(z.literal('')),
  target: z.enum(['driver', 'client']),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
});

export type CityGuideFormValues = z.infer<typeof cityGuideFormSchema>;
