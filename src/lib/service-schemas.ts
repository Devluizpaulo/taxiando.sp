
import * as z from 'zod';

export const serviceFormSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  category: z.string().min(3, "A categoria é obrigatória."),
  description: z.string().min(30, "A descrição deve ter pelo menos 30 caracteres."),
  price: z.string().min(1, "O preço ou forma de consulta é obrigatório."),
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
