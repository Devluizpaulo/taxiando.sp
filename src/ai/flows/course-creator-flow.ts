'use server';
/**
 * @fileOverview An AI flow to generate a complete course structure from a topic.
 *
 * - generateCourseStructure - A function that handles the course generation process.
 * - GenerateCourseInput - The input type for the function.
 * - GenerateCourseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { nanoid } from 'nanoid';

// --- Input and Output Schemas ---

const GenerateCourseInputSchema = z.object({
  topic: z.string().describe('The central topic for the course, e.g., "direção defensiva para taxistas" or "história de São Paulo".'),
  targetAudience: z.string().optional().describe('The target audience for the course, e.g., "iniciantes" or "motoristas experientes".'),
});

export type GenerateCourseInput = z.infer<typeof GenerateCourseInputSchema>;

const QuizQuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(QuizQuestionOptionSchema),
  correctOptionId: z.string(),
});

const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().describe("Detailed lesson content in Markdown format."),
  totalDuration: z.number().describe("Estimated duration in minutes."),
});

const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  lessons: z.array(LessonSchema),
  quiz: z.array(QuizQuestionSchema).optional().describe("An optional quiz at the end of the module with 2-3 questions."),
});

const GenerateCourseOutputSchema = z.object({
  title: z.string().describe("A compelling and clear title for the course."),
  description: z.string().describe("A short, engaging summary of the course, around 150-200 characters."),
  category: z.string().describe("The most relevant category for the course (e.g., Segurança, Atendimento, Legislação)."),
  modules: z.array(ModuleSchema).describe("A list of 2 to 4 modules that structure the course."),
});

export type GenerateCourseOutput = z.infer<typeof GenerateCourseOutputSchema>;


// --- Main exported function ---

export async function generateCourseStructure(input: GenerateCourseInput): Promise<GenerateCourseOutput> {
  return generateCourseFlow(input);
}


// --- Genkit Prompt Definition ---

const prompt = ai.definePrompt({
  name: 'generateCoursePrompt',
  input: { schema: GenerateCourseInputSchema },
  output: { schema: GenerateCourseOutputSchema },
  prompt: `You are an expert instructional designer specializing in creating vocational training courses for professional drivers in Brazil. Your task is to generate a complete, well-structured course from a given topic. Your entire output must be in Brazilian Portuguese.

The course should be practical, clear, and engaging.

**Instructions:**
1.  **Course Title:** Create a clear and attractive title for the course.
2.  **Course Description:** Write a concise summary of what the student will learn.
3.  **Category:** Assign the most appropriate category (e.g., Segurança, Atendimento, Legislação, Finanças, Bem-estar).
4.  **Modules:**
    *   Generate 2 to 4 logical modules. Each module must have a clear title.
    *   For each module, create 2 to 3 lessons.
    *   For each lesson, provide a title and detailed content in Markdown format. The content should be educational and well-structured.
    *   Estimate the duration (in minutes) for each lesson.
5.  **Quizzes:**
    *   At the end of each module, create a short quiz with 2 or 3 multiple-choice questions to test the key concepts of that module.
    *   For each question, provide 3-4 options and clearly indicate which one is correct. Ensure only one option is correct.

**User Input:**
*   **Topic:** {{{topic}}}
*   **Target Audience:** {{{targetAudience}}}

Generate the complete course structure based on these instructions.
`,
});


// --- Genkit Flow Definition ---

const generateCourseFlow = ai.defineFlow(
  {
    name: 'generateCourseFlow',
    inputSchema: GenerateCourseInputSchema,
    outputSchema: GenerateCourseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(`Failed to generate course content.`);
    }

    // Assign unique IDs to all entities, as the AI doesn't generate them.
    const structuredOutput: GenerateCourseOutput = {
      ...output,
      modules: output.modules.map(module => ({
        ...module,
        id: nanoid(),
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          id: nanoid(),
        })),
        quiz: module.quiz?.map(q => {
          const optionsWithIds = q.options.map(o => ({ ...o, id: nanoid() }));
          const correctOption = optionsWithIds.find(o => o.isCorrect);
          return {
            ...q,
            id: nanoid(),
            options: optionsWithIds,
            correctOptionId: correctOption?.id || optionsWithIds[0]?.id || ''
          }
        }) || [],
      })),
    };

    return structuredOutput;
  }
);
