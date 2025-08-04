

import { z } from 'zod';

// Schema para questões de múltipla escolha
export const multipleChoiceQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('multiple_choice'),
  question: z.string().min(1, 'Pergunta é obrigatória'),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Opção é obrigatória'),
    isCorrect: z.boolean(),
    explanation: z.string().optional()
  })).min(2, 'Mínimo 2 opções').max(6, 'Máximo 6 opções'),
  points: z.number().min(1).max(10).default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  tags: z.array(z.string()).optional()
});

// Schema para questões de verdadeiro/falso
export const trueFalseQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('true_false'),
  question: z.string().min(1, 'Pergunta é obrigatória'),
  correctAnswer: z.boolean(),
  explanation: z.string().optional(),
  points: z.number().min(1).max(10).default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

// Schema para questões de texto livre
export const textQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  question: z.string().min(1, 'Pergunta é obrigatória'),
  expectedAnswer: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  points: z.number().min(1).max(10).default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

// Schema para exercícios práticos
export const exerciseSchema = z.object({
  id: z.string(),
  type: z.literal('exercise'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  instructions: z.string().min(1, 'Instruções são obrigatórias'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  estimatedTime: z.number().min(1).max(120).default(15), // em minutos
  materials: z.array(z.string()).optional(),
  solution: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

// Schema para resumos
export const summarySchema = z.object({
  id: z.string(),
  type: z.literal('summary'),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  keyPoints: z.array(z.string()).min(1, 'Pelo menos um ponto chave'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  tags: z.array(z.string()).optional()
});

// Schema para provas/avaliações
export const examSchema = z.object({
  id: z.string(),
  type: z.literal('exam'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  timeLimit: z.number().min(5).max(180).default(30), // em minutos
  passingScore: z.number().min(50).max(100).default(70),
  questions: z.array(z.union([
    multipleChoiceQuestionSchema,
    trueFalseQuestionSchema,
    textQuestionSchema
  ])).min(1, 'Pelo menos uma questão'),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  allowRetake: z.boolean().default(false),
  maxAttempts: z.number().min(1).max(5).default(3)
});

// Schema para testes de conhecimento
export const knowledgeTestSchema = z.object({
  id: z.string(),
  type: z.literal('knowledge_test'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  questions: z.array(z.union([
    multipleChoiceQuestionSchema,
    trueFalseQuestionSchema
  ])).min(1, 'Pelo menos uma questão'),
  timeLimit: z.number().min(5).max(60).default(15),
  passingScore: z.number().min(50).max(100).default(70),
  showResults: z.boolean().default(true),
  allowRetake: z.boolean().default(true)
});

// Schema para atividades interativas
export const interactiveActivitySchema = z.object({
  id: z.string(),
  type: z.literal('interactive'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  activityType: z.enum(['drag_drop', 'matching', 'fill_blank', 'hotspot', 'simulation']),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  instructions: z.string().min(1, 'Instruções são obrigatórias'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  estimatedTime: z.number().min(1).max(60).default(10),
  feedback: z.string().optional()
});

// Schema para recursos complementares
export const resourceSchema = z.object({
  id: z.string(),
  type: z.literal('resource'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  resourceType: z.enum(['pdf', 'video', 'audio', 'link', 'document', 'presentation']),
  url: z.string().url().optional(),
  file: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Schema para elementos educacionais
export const educationalElementSchema = z.union([
  exerciseSchema,
  summarySchema,
  examSchema,
  knowledgeTestSchema,
  interactiveActivitySchema,
  resourceSchema
]);

// Schema para páginas de aula
export const lessonPageSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  order: z.number().min(0),
  elements: z.array(educationalElementSchema).optional(),
  estimatedTime: z.number().min(1).max(120).default(10)
});

// Schema para materiais
export const materialSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['pdf', 'video', 'audio', 'document', 'presentation', 'spreadsheet', 'image']),
  url: z.string().url().optional(),
  file: z.string().optional(),
  size: z.number().optional(),
  tags: z.array(z.string()).optional()
});

// Schema para aulas
export const lessonSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.enum(['single', 'multi_page']),
  content: z.string().optional(),
  totalDuration: z.number().min(0).default(0),
  pages: z.array(lessonPageSchema).optional(),
  materials: z.array(materialSchema).optional(),
  questions: z.array(z.union([
    multipleChoiceQuestionSchema,
    trueFalseQuestionSchema,
    textQuestionSchema
  ])).optional(),
  exercises: z.array(exerciseSchema).optional(),
  summaries: z.array(summarySchema).optional(),
  exams: z.array(examSchema).optional(),
  knowledgeTests: z.array(knowledgeTestSchema).optional(),
  interactiveActivities: z.array(interactiveActivitySchema).optional(),
  resources: z.array(resourceSchema).optional()
});

// Schema para módulos
export const moduleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  lessons: z.array(lessonSchema).optional(),
  badge: z.string().optional(),
  order: z.number().min(0).default(0)
});

// Schema principal do curso
export const courseFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  status: z.enum(['Draft', 'Published', 'Archived']).default('Draft'),
  price: z.number().min(0).default(0),
  duration: z.number().min(0).default(0),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  category: z.string().optional(),
  tags: z.string().optional(),
  certificate: z.enum(['none', 'basic', 'advanced']).default('none'),
  access: z.enum(['lifetime', '1year', '6months']).default('lifetime'),
  modules: z.array(moduleSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonPage = z.infer<typeof lessonPageSchema>;
export type Material = z.infer<typeof materialSchema>;
export type EducationalElement = z.infer<typeof educationalElementSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type Exam = z.infer<typeof examSchema>;
export type KnowledgeTest = z.infer<typeof knowledgeTestSchema>;
export type InteractiveActivity = z.infer<typeof interactiveActivitySchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseQuestionSchema>;
export type TextQuestion = z.infer<typeof textQuestionSchema>;
