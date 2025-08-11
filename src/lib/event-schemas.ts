
import * as z from 'zod';

export const eventFormSchema = z.object({
    title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
    description: z.string().min(20, { message: "A descrição deve ter pelo menos 20 caracteres." }),
    location: z.string().min(3, { message: "O local é obrigatório." }),
    startDate: z.date({ required_error: "A data e hora de início são obrigatórias." }),
    driverSummary: z.string().min(5, { message: "O resumo tático é obrigatório." }),
    peakTimes: z.string().min(5, { message: "A dica de horários de pico é obrigatória." }),
    trafficTips: z.string().min(5, { message: "A dica de trânsito é obrigatória." }),
    pickupPoints: z.string().min(5, { message: "A sugestão de pontos de embarque é obrigatória." }),
    mapUrl: z.string().url("A URL do mapa precisa ser um link válido.").min(1, "A URL do mapa é obrigatória."),
    category: z.enum(['show', 'festa', 'esporte', 'corporativo', 'outro']).default('outro'),
    isRecurring: z.boolean().default(false),
    additionalDates: z.array(z.object({
        date: z.date()
    })).optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
