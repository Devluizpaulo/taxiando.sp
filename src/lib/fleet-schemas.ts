
import * as z from 'zod';

export const vehicleFormSchema = z.object({
  plate: z.string().min(7, "A placa deve ter 7 caracteres.").max(8, "Formato de placa inválido."),
  make: z.string().min(2, "A marca é obrigatória."),
  model: z.string().min(2, "O modelo é obrigatório."),
  year: z.coerce.number().min(2000, "O ano deve ser superior a 2000.").max(new Date().getFullYear() + 1, "Ano inválido."),
  status: z.enum(['Disponível', 'Alugado', 'Em Manutenção'], { required_error: "O status é obrigatório."}),
  dailyRate: z.coerce.number().min(1, "O valor da diária é obrigatório."),
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
  condition: z.string().min(1, "A condição é obrigatória."),
  transmission: z.enum(['automatic', 'manual'], { required_error: "O tipo de câmbio é obrigatório."}),
  fuelType: z.enum(['flex', 'gnv', 'diesel', 'electric'], { required_error: "O tipo de combustível é obrigatório."}),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres.").max(500, "Limite de 500 caracteres."),
  paymentTerms: z.string().min(3, "As condições são obrigatórias."),
  paymentMethods: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
