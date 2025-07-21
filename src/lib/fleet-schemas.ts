
import * as z from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const vehicleFormSchema = z.object({
  plate: z.string().min(7, "A placa deve ter 7 caracteres.").max(8, "Formato de placa inválido."),
  make: z.string().min(2, "A marca é obrigatória."),
  model: z.string().min(2, "O modelo é obrigatório."),
  year: z.coerce.number().min(2000, "O ano deve ser superior a 2000.").max(new Date().getFullYear() + 1, "Ano inválido."),
  isZeroKm: z.boolean().default(false).optional(),
  type: z.enum(['hatch', 'sedan', 'suv', 'minivan', 'other'], { required_error: "O tipo de veículo é obrigatório."}),
  status: z.enum(['Disponível', 'Alugado', 'Em Manutenção'], { required_error: "O status é obrigatório."}),
  dailyRate: z.coerce.number().min(1, "O valor da diária é obrigatório."),
  imageUrls: z.array(z.object({url: z.string()})).default([]),
  imageFiles: z.array(z.any())
    .refine((files) => !files || files.length <= 4, `Você pode enviar no máximo 4 imagens.`)
    .optional(),
  condition: z.string().min(1, "A condição é obrigatória."),
  transmission: z.enum(['automatic', 'manual'], { required_error: "O tipo de câmbio é obrigatório."}),
  fuelType: z.enum(['flex', 'gnv', 'hybrid', 'electric'], { required_error: "O tipo de combustível é obrigatório."}),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres.").max(500, "Limite de 500 caracteres."),
  internalNotes: z.string().optional(),
  paymentTerms: z.string().min(3, "As condições são obrigatórias."),
  paymentMethods: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  hasParkingLot: z.boolean().default(false).optional(),
  parkingLotAddress: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.hasParkingLot && (!data.parkingLotAddress || data.parkingLotAddress.length < 5)) {
        ctx.addIssue({
            code: 'custom',
            path: ['parkingLotAddress'],
            message: 'O endereço do ponto é obrigatório se a opção for selecionada.'
        });
    }
}).refine(data => {
    return data.imageUrls.length > 0 || (data.imageFiles && data.imageFiles.length > 0);
}, {
    message: "Pelo menos uma imagem é obrigatória.",
    path: ["imageFiles"],
});


export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
