

import * as z from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const blogPostFormSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  slug: z.string().min(3, "O slug é obrigatório.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve conter apenas letras minúsculas, números e hífens."),
  excerpt: z.string().min(20, "O resumo é obrigatório.").max(200, "O resumo deve ter no máximo 200 caracteres."),
  imageUrl: z.string().url("URL da imagem de capa inválida.").optional().or(z.literal('')),
  imageFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas os formatos .jpg, .jpeg, .png e .webp são aceitos.")
    .optional(),
  content: z.string().min(100, "O conteúdo deve ter pelo menos 100 caracteres."),
  status: z.enum(['Published', 'Draft']),
  source: z.string().optional(),
  sourceUrl: z.string().url("URL da fonte inválida.").optional().or(z.literal('')),
}).refine(data => {
    // For new posts, either imageUrl or imageFile must be present.
    // For existing posts being edited, imageUrl will be populated from the start.
    return !!data.imageUrl || !!data.imageFile;
}, {
    message: "Uma imagem de capa (URL ou arquivo) é obrigatória.",
    path: ["imageUrl"], // Report error on the imageUrl field for simplicity
});


export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;
