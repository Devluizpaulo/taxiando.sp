'use server';

/**
 * @fileOverview A flow to summarize long texts for taxi drivers.
 *
 * - summarizeTranscript - A function that handles the text summarization process.
 * - SummarizeTranscriptInput - The input type for the summarizeTranscript function.
 * - SummarizeTranscriptOutput - The return type for the summarizeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('A long text to be summarized, like a news article, a new regulation, or a transcript.'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

const SummarizeTranscriptOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the text, formatted in Markdown with bullet points for easy reading.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;

export async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: {schema: SummarizeTranscriptInputSchema},
  output: {schema: SummarizeTranscriptOutputSchema},
  prompt: `You are an expert assistant for taxi drivers in São Paulo. Your task is to summarize a long text into concise, easy-to-read bullet points. The summary must highlight the most important information a driver needs to know quickly. The original text could be a news article, a new traffic regulation, or a transcript of an audio message. Your entire output must be in Brazilian Portuguese.

  Please summarize the following text:

  Transcript: {{{transcript}}}`,
});

const summarizeTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeTranscriptFlow',
    inputSchema: SummarizeTranscriptInputSchema,
    outputSchema: SummarizeTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
