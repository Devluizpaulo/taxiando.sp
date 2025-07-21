import * as z from 'zod';

// --- Schemas ---
export const quizQuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "O texto da opção é obrigatório."),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(5, "A pergunta é obrigatória."),
  options: z.array(quizQuestionOptionSchema).min(2, "A questão deve ter pelo menos 2 opções."),
  correctOptionId: z.string({ required_error: "Selecione uma resposta correta." }).min(1, "Selecione uma resposta correta."),
});

export const quizFormSchema = z.object({
  title: z.string().min(5, "O título é obrigatório."),
  questions: z.array(quizQuestionSchema).min(1, "O quiz deve ter pelo menos uma questão."),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
