'use server';
/**
 * @fileOverview An AI flow to generate a quiz from a topic.
 *
 * - generateQuiz - A function that handles quiz generation.
 * - GenerateQuizInput - The input type for the function.
 * - GenerateQuizOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { nanoid } from 'nanoid';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz, e.g., "regras do taxista em aeroportos" or "história do táxi em SP".'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;


const QuizQuestionOptionSchema = z.object({
    text: z.string().describe('The text content of an answer option.'),
    isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
});

const QuizQuestionSchema = z.object({
    question: z.string().describe('The text of the quiz question.'),
    options: z.array(QuizQuestionOptionSchema).describe('A list of possible answers for the question.'),
});

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe("A compelling and short title for the quiz."),
  questions: z.array(QuizQuestionSchema).describe("A list of questions for the quiz. Should contain between 3 and 5 questions."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert creator of educational content for taxi drivers in São Paulo, Brazil. Your task is to create an engaging and informative quiz based on a given topic.

Your entire output must be in Brazilian Portuguese.

The quiz should have a short, catchy title and contain between 3 and 5 multiple-choice questions. For each question, you must provide a list of options and clearly indicate which one is the correct answer. The options should be plausible but only one can be correct.

User's Topic: {{{topic}}}`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(`Failed to generate quiz content.`);
    }
    return output;
  }
);
