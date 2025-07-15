
import * as z from 'zod';

// --- Coupon Schemas ---

export const couponFormSchema = z.object({
  code: z.string().min(3, "O código é obrigatório.").max(20, "Máximo de 20 caracteres.").transform(value => value.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed'], { required_error: "O tipo de desconto é obrigatório."}),
  discountValue: z.coerce.number().min(0.01, "O valor do desconto é obrigatório."),
  maxUses: z.coerce.number().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;


// --- Partner Schemas ---

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export const partnerFormSchema = z.object({
  name: z.string().min(3, "O nome do parceiro é obrigatório."),
  linkUrl: z.string().url("A URL de destino é obrigatória e deve ser válida."),
  size: z.enum(['small', 'medium', 'large'], { required_error: "O tamanho do banner é obrigatório."}),
  isActive: z.boolean().default(true),
  imageUrls: z.array(z.string().url("URL inválida.")).min(1, "Pelo menos uma imagem é obrigatória."),
  imageFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Tamanho máximo do arquivo é 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas formatos de imagem são aceitos.")
    .optional(),
});

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;
