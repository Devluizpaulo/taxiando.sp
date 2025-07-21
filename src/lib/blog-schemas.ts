
import * as z from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const blogPostFormSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  slug: z.string().min(3, "O slug é obrigatório.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve conter apenas letras minúsculas, números e hífens."),
  category: z.string().min(3, "A categoria é obrigatória."),
  excerpt: z.string().min(20, "O resumo é obrigatório.").max(200, "O resumo deve ter no máximo 200 caracteres."),
  imageUrls: z.array(z.string().url("URL da imagem de capa inválida.")).min(1, "Pelo menos uma imagem é obrigatória."),
  imageFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas os formatos .jpg, .jpeg, .png e .webp são aceitos.")
    .optional(),
  content: z.string().min(100, "O conteúdo deve ter pelo menos 100 caracteres."),
  status: z.enum(['Published', 'Draft']),
  source: z.string().optional(),
  sourceUrl: z.string().url("URL da fonte inválida.").optional().or(z.literal('')),
  relatedLinks: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(3, "O título do link é obrigatório."),
    url: z.string().url("A URL do link é inválida."),
  })).optional(),
}).refine(data => {
    // Para novos posts, pelo menos uma imagem (URL ou arquivo) deve estar presente.
    return (data.imageUrls && data.imageUrls.length > 0) || !!data.imageFile;
}, {
    message: "Uma imagem de capa (URL ou arquivo) é obrigatória.",
    path: ["imageUrls"],
});


export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;
