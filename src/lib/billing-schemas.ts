
import * as z from 'zod';

export const packageFormSchema = z.object({
  name: z.string().min(3, "O nome do pacote é obrigatório."),
  description: z.string().min(10, "A descrição é obrigatória."),
  credits: z.coerce.number().min(1, "O pacote deve dar pelo menos 1 crédito."),
  price: z.coerce.number().min(0.5, "O preço é obrigatório."),
  priceId: z.string().min(3, "O ID do Preço do Mercado Pago é obrigatório."),
  popular: z.boolean().default(false),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;
