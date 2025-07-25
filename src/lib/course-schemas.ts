

import * as z from 'zod';

export const supportingMaterialSchema = z.object({
  name: z.string().min(1, "O nome do material é obrigatório."),
  url: z.string().url("URL inválida."),
});

export const quizOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "O texto da opção é obrigatório."),
  isCorrect: z.boolean().default(false),
});

export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "A pergunta é obrigatória."),
  options: z.array(quizOptionSchema).min(2, "A questão deve ter pelo menos 2 opções."),
}).refine(data => data.options.filter(opt => opt.isCorrect).length === 1, {
  message: "Exatamente uma opção deve ser marcada como correta.",
  path: ['options'],
});

export const lessonPageSchema = z.object({
  id: z.string(),
  type: z.enum(['video', 'text', 'file']),
  title: z.string().optional(),
  videoUrl: z.string().url().optional(),
  textContent: z.string().optional(),
  files: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
});

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().min(10, 'Adicione um resumo ou índice de aprendizado para a aula.'),
  pages: z.array(lessonPageSchema).min(1, 'Adicione pelo menos uma página/conteúdo para a aula.'),
  type: z.enum(['video', 'text', 'quiz', 'audio'], { required_error: "Selecione o tipo de aula."}),
  duration: z.coerce.number().min(1, "A duração deve ser de pelo menos 1 minuto."),
  content: z.string().optional(),
  contentBlocks: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('heading'), level: z.number(), text: z.string() }),
    z.object({ type: z.literal('paragraph'), text: z.string() }),
    z.object({ type: z.literal('list'), style: z.enum(['bullet', 'numbered']), items: z.array(z.string()) }),
    z.object({ type: z.literal('image'), url: z.string(), alt: z.string().optional() }),
    z.object({ type: z.literal('exercise'), question: z.string(), answer: z.string(), hints: z.array(z.string()).optional() }),
    z.object({ type: z.literal('quiz'), questions: z.array(quizQuestionSchema) })
  ])).optional(),
  audioFile: z.any().optional(),
  materials: z.array(supportingMaterialSchema).optional(),
  questions: z.array(quizQuestionSchema).optional(),
  passingScore: z.coerce.number().min(0).max(100).optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'video') {
        if (!data.content || !z.string().url({ message: "Por favor, insira uma URL válida."}).safeParse(data.content).success) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A URL do vídeo é obrigatória e deve ser válida.", path: ['content'] });
        }
    }
    if (data.type === 'text') {
        if ((!data.contentBlocks || data.contentBlocks.length === 0) && (!data.content || data.content.length < 50)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A aula deve ter pelo menos um bloco de conteúdo ou 50 caracteres de texto.", path: ['contentBlocks'] });
        }
    }
     if (data.type === 'audio') {
        if (!data.content && !data.audioFile) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "É necessário enviar um arquivo de áudio ou fornecer uma URL existente.", path: ['audioFile'] });
        }
    }
    if (data.type === 'quiz') {
        if (!data.questions || data.questions.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Um quiz precisa de pelo menos uma questão.", path: ['questions'] });
        }
        if (data.passingScore === undefined || data.passingScore === null) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A nota para aprovação é obrigatória.", path: ['passingScore'] });
        }
    }
});

export const badgeSchema = z.object({
    name: z.string().min(3, "O nome da medalha é obrigatório.").optional().or(z.literal('')),
});

export const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "O título do módulo é obrigatório."),
  lessons: z.array(lessonSchema).min(1, "Cada módulo precisa de ao menos uma aula."),
  badge: badgeSchema.optional(),
});

export const courseFormSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }),
  modules: z.array(moduleSchema).min(1, "O curso deve ter pelo menos um módulo."),
  difficulty: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  investmentCost: z.coerce.number().min(0).default(0).optional(),
  priceInCredits: z.coerce.number().min(0).default(0).optional(),
  authorInfo: z.string().optional(),
  legalNotice: z.string().optional(),
  coverImageUrl: z.string().url('A capa deve ser uma URL válida.').optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
