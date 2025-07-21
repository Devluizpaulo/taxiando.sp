
import * as z from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const serviceFormSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  category: z.string().min(3, "A categoria é obrigatória."),
  description: z.string().min(30, "A descrição deve ter pelo menos 30 caracteres."),
  price: z.string().min(1, "O preço ou forma de consulta é obrigatório."),
  imageUrls: z.array(z.object({url: z.string()})).default([]),
  imageFiles: z.any()
    .refine((files) => !files || files.length <= 4, `Você pode enviar no máximo 4 imagens.`)
    .optional(),
}).refine(data => {
    return data.imageUrls.length > 0 || (data.imageFiles && data.imageFiles.length > 0);
}, {
    message: "Pelo menos uma imagem é obrigatória.",
    path: ["imageFiles"],
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
