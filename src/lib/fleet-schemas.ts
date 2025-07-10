

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
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
  imageFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas os formatos .jpg, .jpeg, .png e .webp são aceitos.")
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
    return !!data.imageUrl || !!data.imageFile;
}, {
    message: "Uma imagem (URL, upload ou galeria) é obrigatória.",
    path: ["imageUrl"],
});


export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
