
import * as z from 'zod';

// Tipos específicos por categoria
const gastronomiaSchema = z.object({
  priceRange: z.enum(['$', '$$', '$$$', '$$$$'], { required_error: 'Selecione a faixa de preço.' }),
  cuisineType: z.string().min(2, "Tipo de culinária é obrigatório."),
  openingHours: z.string().min(5, "Horário de funcionamento é obrigatório."),
  menuUrl: z.string().url("URL do cardápio inválida.").optional().or(z.literal('')),
});

const dayOffSchema = z.object({
  travelTime: z.string().min(2, "Tempo de deslocamento é obrigatório."),
  estimatedCost: z.string().min(2, "Custo estimado é obrigatório."),
  positivePoints: z.array(z.string()).min(1, "Selecione pelo menos um ponto positivo."),
  nearbyFood: z.string().optional(),
  idealFor: z.array(z.string()).min(1, "Selecione para quem é ideal."),
  bonusTip: z.string().optional(),
});

const pousadaSchema = z.object({
  partnershipType: z.enum(['discount', 'gift', 'other'], { required_error: 'Selecione o tipo de parceria.' }),
  couponCode: z.string().optional(),
  validUntil: z.string().optional(),
  bookingUrl: z.string().url("URL de reserva inválida.").optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  averagePrice: z.string().min(2, "Preço médio é obrigatório."),
});

const turismoSchema = z.object({
  bestTime: z.string().min(2, "Melhor horário é obrigatório."),
  needsTicket: z.boolean(),
  ticketUrl: z.string().url("URL de compra inválida.").optional().or(z.literal('')),
  hasLocalGuide: z.boolean(),
  accessibilityLevel: z.enum(['low', 'medium', 'high'], { required_error: 'Selecione o nível de acessibilidade.' }),
});

// Novos schemas para as categorias expandidas
const culturaSchema = z.object({
  eventType: z.string().min(2, "Tipo de evento é obrigatório."),
  entryFee: z.string().min(2, "Informação sobre entrada é obrigatória."),
  schedule: z.string().min(2, "Horário de funcionamento é obrigatório."),
  website: z.string().url("URL do site inválida.").optional().or(z.literal('')),
  hasGuidedTour: z.boolean(),
  suitableForChildren: z.boolean(),
});

const nightlifeSchema = z.object({
  musicType: z.string().min(2, "Tipo de música é obrigatório."),
  dressCode: z.string().optional(),
  ageRestriction: z.string().optional(),
  coverCharge: z.string().optional(),
  parkingAvailable: z.boolean(),
  foodAvailable: z.boolean(),
});

const roteirosSchema = z.object({
  duration: z.string().min(2, "Duração do roteiro é obrigatória."),
  distance: z.string().min(2, "Distância é obrigatória."),
  transportation: z.string().min(2, "Meio de transporte é obrigatório."),
  bestSeason: z.string().min(2, "Melhor época é obrigatória."),
  difficulty: z.enum(['easy', 'medium', 'hard'], { required_error: 'Selecione a dificuldade.' }),
  includesGuide: z.boolean(),
});

const comprasSchema = z.object({
  storeType: z.string().min(2, "Tipo de loja é obrigatório."),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$'], { required_error: 'Selecione a faixa de preço.' }),
  specialties: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade."),
  parking: z.boolean(),
  foodCourt: z.boolean(),
  openingHours: z.string().min(5, "Horário de funcionamento é obrigatório."),
});

const aventuraSchema = z.object({
  activityType: z.string().min(2, "Tipo de atividade é obrigatório."),
  difficulty: z.enum(['easy', 'medium', 'hard'], { required_error: 'Selecione a dificuldade.' }),
  duration: z.string().min(2, "Duração é obrigatória."),
  equipmentNeeded: z.boolean(),
  guideRequired: z.boolean(),
  bestSeason: z.string().min(2, "Melhor época é obrigatória."),
  safetyLevel: z.enum(['low', 'medium', 'high'], { required_error: 'Selecione o nível de segurança.' }),
});

const familiaSchema = z.object({
  ageRange: z.string().min(2, "Faixa etária é obrigatória."),
  activities: z.array(z.string()).min(1, "Selecione pelo menos uma atividade."),
  hasPlayground: z.boolean(),
  hasFood: z.boolean(),
  hasBathroom: z.boolean(),
  strollerFriendly: z.boolean(),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$'], { required_error: 'Selecione a faixa de preço.' }),
});

const petSchema = z.object({
  petTypes: z.array(z.string()).min(1, "Selecione pelo menos um tipo de pet."),
  hasPetArea: z.boolean(),
  hasPetMenu: z.boolean(),
  requiresLeash: z.boolean(),
  hasVetNearby: z.boolean(),
  petFee: z.string().optional(),
});

export const cityGuideFormSchema = z.object({
  // Campos genéricos (comuns a todas as categorias)
  title: z.string().min(5, "O título é obrigatório."),
  description: z.string().min(20, "A descrição é obrigatória."),
  location: z.string().min(3, "A localização é obrigatória."),
  region: z.enum([
    'zona-norte', 'zona-sul', 'zona-leste', 'zona-oeste', 'centro',
    'abc', 'litoral-sul', 'vale-paraiba', 'interior', 'serra-mantiqueira',
    'circuito-aguas', 'litoral-norte', 'oeste-paulista', 'itu-indaiatuba-salto'
  ], { required_error: 'Selecione a região.' }),
  imageUrls: z.array(z.string().url("URL da imagem inválida.")).optional().default([]),
  target: z.enum(['driver', 'client', 'both'], { required_error: 'Selecione o perfil.' }),
  tags: z.array(z.string()).default([]),
  comment: z.string().max(300).optional(),
  mapUrl: z.string().url("URL do mapa inválida.").optional().or(z.literal('')),
  
  // Tipo de dica (determina os campos específicos)
  tipType: z.enum([
    'gastronomia', 'day-off', 'pousada', 'turismo', 'cultura', 
    'nightlife', 'roteiros', 'compras', 'aventura', 'familia', 'pet', 'outro'
  ], { 
    required_error: 'Selecione o tipo de dica.' 
  }),
  
  // Campos específicos por categoria (condicionais)
  gastronomia: gastronomiaSchema.optional(),
  dayOff: dayOffSchema.optional(),
  pousada: pousadaSchema.optional(),
  turismo: turismoSchema.optional(),
  cultura: culturaSchema.optional(),
  nightlife: nightlifeSchema.optional(),
  roteiros: roteirosSchema.optional(),
  compras: comprasSchema.optional(),
  aventura: aventuraSchema.optional(),
  familia: familiaSchema.optional(),
  pet: petSchema.optional(),
  
  // Campo para colaborador
  contributorName: z.string().optional(),
  
  // Status da dica
  status: z.enum(['draft', 'published', 'pending']).default('draft'),
}).refine((data) => {
  // Validação condicional baseada no tipo de dica
  if (data.tipType === 'gastronomia' && !data.gastronomia) {
    return false;
  }
  if (data.tipType === 'day-off' && !data.dayOff) {
    return false;
  }
  if (data.tipType === 'pousada' && !data.pousada) {
    return false;
  }
  if (data.tipType === 'turismo' && !data.turismo) {
    return false;
  }
  if (data.tipType === 'cultura' && !data.cultura) {
    return false;
  }
  if (data.tipType === 'nightlife' && !data.nightlife) {
    return false;
  }
  if (data.tipType === 'roteiros' && !data.roteiros) {
    return false;
  }
  if (data.tipType === 'compras' && !data.compras) {
    return false;
  }
  if (data.tipType === 'aventura' && !data.aventura) {
    return false;
  }
  if (data.tipType === 'familia' && !data.familia) {
    return false;
  }
  if (data.tipType === 'pet' && !data.pet) {
    return false;
  }
  return true;
}, {
  message: "Preencha os campos específicos para o tipo de dica selecionado.",
  path: ["tipType"]
});

export type CityGuideFormValues = z.infer<typeof cityGuideFormSchema>;

// Tipos auxiliares para as categorias específicas
export type GastronomiaFields = z.infer<typeof gastronomiaSchema>;
export type DayOffFields = z.infer<typeof dayOffSchema>;
export type PousadaFields = z.infer<typeof pousadaSchema>;
export type TurismoFields = z.infer<typeof turismoSchema>;
export type CulturaFields = z.infer<typeof culturaSchema>;
export type NightlifeFields = z.infer<typeof nightlifeSchema>;
export type RoteirosFields = z.infer<typeof roteirosSchema>;
export type ComprasFields = z.infer<typeof comprasSchema>;
export type AventuraFields = z.infer<typeof aventuraSchema>;
export type FamiliaFields = z.infer<typeof familiaSchema>;
export type PetFields = z.infer<typeof petSchema>;
