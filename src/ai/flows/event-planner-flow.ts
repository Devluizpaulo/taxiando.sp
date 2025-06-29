'use server';
/**
 * @fileOverview An AI flow to help plan events by gathering location details and generating an image.
 *
 * - planEvent - A function that handles the event planning process.
 * - EventPlannerInput - The input type for the planEvent function.
 * - EventPlannerOutput - The return type for the planEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventPlannerInputSchema = z.object({
  locationQuery: z.string().describe('A search query for a location, like "Parque Ibirapuera, São Paulo" or "MASP".'),
});
export type EventPlannerInput = z.infer<typeof EventPlannerInputSchema>;

const EventPlannerOutputSchema = z.object({
  location: z.string().describe("The full, formatted address of the found location."),
  description: z.string().describe("A brief, engaging description for the event, highlighting the location's features. Should be around 20-40 words."),
  mapUrl: z.string().describe("A valid Google Maps search URL for the location, like 'https://www.google.com/maps/search/?api=1&query=...'"),
  bestTime: z.string().describe("A useful tip about the best time to visit or hold an event there, for drivers."),
  trafficTips: z.string().describe("A useful tip about traffic, access routes, or parking for drivers."),
  imageUrl: z.string().describe("A generated image of the location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type EventPlannerOutput = z.infer<typeof EventPlannerOutputSchema>;

export async function planEvent(input: EventPlannerInput): Promise<EventPlannerOutput> {
  return eventPlannerFlow(input);
}

const textDetailsPrompt = ai.definePrompt({
  name: 'eventDetailsPrompt',
  input: {schema: EventPlannerInputSchema},
  output: {schema: EventPlannerOutputSchema.omit({imageUrl: true})},
  prompt: `You are an event planning assistant for the city of São Paulo, Brazil.
Given a location query, provide detailed, structured information about it.
The information should be useful for taxi drivers, including tips about traffic and best times for passenger pickups.
For the mapUrl, create a Google Maps search URL, like "https://www.google.com/maps/search/?api=1&query=..." with the url-encoded query.
The output must be in Brazilian Portuguese.

Location Query: {{{locationQuery}}}`
});

const eventPlannerFlow = ai.defineFlow(
  {
    name: 'eventPlannerFlow',
    inputSchema: EventPlannerInputSchema,
    outputSchema: EventPlannerOutputSchema,
  },
  async (input) => {
    // Generate text details and image in parallel for better performance.
    const [textDetailsPromise, imagePromise] = await Promise.allSettled([
        textDetailsPrompt(input),
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a vibrant, high-quality, photorealistic image of the following location, suitable for an event promotion: ${input.locationQuery}. The image should be in a 16:9 aspect ratio and look like a real photo.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        })
    ]);

    if (textDetailsPromise.status === 'rejected' || !textDetailsPromise.value.output) {
      throw new Error(`Failed to get text details: ${textDetailsPromise.reason || 'No output'}`);
    }

    if (imagePromise.status === 'rejected' || !imagePromise.value.media?.url) {
      throw new Error(`Failed to generate image: ${imagePromise.reason || 'No media URL'}`);
    }

    return {
      ...textDetailsPromise.value.output,
      imageUrl: imagePromise.value.media.url,
    };
  }
);
