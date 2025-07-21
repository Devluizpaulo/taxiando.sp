import * as z from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_PDF_TYPES = ["application/pdf"];

export const bookFormSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  author: z.string().min(3, "O autor é obrigatório."),
  category: z.string().min(3, "A categoria é obrigatória."),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres."),
  coverImageUrl: z.string().url("URL da imagem de capa inválida.").optional().or(z.literal('')),
  pdfUrl: z.string().url("URL do PDF inválida.").optional().or(z.literal('')),
  coverFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Tamanho máximo 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas .jpg, .png e .webp.")
    .optional(),
  pdfFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Tamanho máximo 10MB.`)
    .refine((file) => !file || ACCEPTED_PDF_TYPES.includes(file.type), "Apenas arquivos PDF.")
    .optional(),
}).refine(data => {
    return !!data.coverImageUrl || !!data.coverFile;
}, {
    message: "A imagem da capa (URL ou arquivo) é obrigatória.",
    path: ["coverFile"],
}).refine(data => {
    return !!data.pdfUrl || !!data.pdfFile;
}, {
    message: "O arquivo PDF (URL ou upload) é obrigatório.",
    path: ["pdfFile"],
});

export type BookFormValues = z.infer<typeof bookFormSchema>;
