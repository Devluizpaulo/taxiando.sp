
import * as z from 'zod';

export const blogPostFormSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  slug: z.string().min(3, "O slug é obrigatório.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve conter apenas letras minúsculas, números e hífens."),
  excerpt: z.string().min(20, "O resumo é obrigatório.").max(200, "O resumo deve ter no máximo 200 caracteres."),
  imageUrl: z.string().url("A URL da imagem de capa é obrigatória."),
  content: z.string().min(100, "O conteúdo deve ter pelo menos 100 caracteres."),
  status: z.enum(['Published', 'Draft']),
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;
