'use server';

/**
 * @fileOverview A flow to summarize transcripts from audio/video files.
 *
 * - summarizeTranscript - A function that handles the transcript summarization process.
 * - SummarizeTranscriptInput - The input type for the summarizeTranscript function.
 * - SummarizeTranscriptOutput - The return type for the summarizeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the audio or video file to summarize.'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

const SummarizeTranscriptOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the transcript.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;

export async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: {schema: SummarizeTranscriptInputSchema},
  output: {schema: SummarizeTranscriptOutputSchema},
  prompt: `You are an expert summarizer, skilled at condensing large transcripts into concise summaries.

  Please summarize the following transcript:

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
