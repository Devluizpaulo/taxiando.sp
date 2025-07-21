'use server';
/**
 * @fileOverview An AI flow to generate a blog post from a topic.
 *
 * - generateBlogPost - A function that handles the blog post generation process.
 * - GenerateBlogPostInput - The input type for the function.
 * - GenerateBlogPostOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic or main idea for the blog post, e.g., "novas regras de trânsito em São Paulo" or "dicas para economizar combustível".'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe("A compelling and SEO-friendly title for the blog post."),
  slug: z.string().describe("A URL-friendly slug, using only lowercase letters, numbers, and hyphens."),
  excerpt: z.string().describe("A short, engaging summary of the post, around 150-200 characters."),
  content: z.string().describe("The full blog post content, formatted in Markdown. It should be well-structured with headings, lists, and bold text to be informative and easy to read."),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert content creator and journalist specializing in the transportation sector in São Paulo, Brazil. Your writing style is clear, informative, and engaging for taxi drivers and fleet owners.

Given the user's topic, you must generate a complete blog post. Your entire output must be in Brazilian Portuguese.

The output should be structured according to the output schema.
- The 'title' should be catchy and relevant.
- The 'slug' must be a URL-friendly version of the title.
- The 'excerpt' should be a concise summary to attract readers.
- The 'content' must be written in Markdown format. It should be well-organized, with a logical flow, using headings (#, ##), bold text (**), and lists (-) to improve readability. The content should be substantial and provide real value to the reader.

User's Topic: {{{topic}}}`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(`Failed to generate blog post content.`);
    }
    return output;
  }
);
