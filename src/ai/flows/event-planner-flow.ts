
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
  eventQuery: z.string().describe('A detailed description of an event, like "Show da Taylor Swift no Allianz Parque, 45 mil pessoas, início 21h" or "Virada Cultural no Anhangabaú".'),
});
export type EventPlannerInput = z.infer<typeof EventPlannerInputSchema>;

const EventPlannerOutputSchema = z.object({
  title: z.string().describe("The concise title of the event."),
  location: z.string().describe("The full, formatted address of the found location."),
  description: z.string().describe("A brief, engaging description for the event, highlighting its main attractions. Should be around 20-40 words."),
  driverSummary: z.string().describe("A tactical summary for taxi drivers, focusing on the business opportunity (e.g., high demand, type of public)."),
  peakTimes: z.string().describe("A description of passenger peak times, including arrival and, most importantly, departure times."),
  trafficTips: z.string().describe("A useful tip about traffic, street closures, or access routes for drivers."),
  pickupPoints: z.string().describe("Suggested pickup and drop-off points to avoid traffic and facilitate meeting passengers."),
  mapUrl: z.string().describe("A valid Google Maps search URL for the location, like 'https://www.google.com/maps/search/?api=1&query=...'"),
});
export type EventPlannerOutput = z.infer<typeof EventPlannerOutputSchema>;

export async function planEvent(input: EventPlannerInput): Promise<EventPlannerOutput> {
  return eventPlannerFlow(input);
}

const textDetailsPrompt = ai.definePrompt({
  name: 'eventDetailsPrompt',
  input: {schema: EventPlannerInputSchema},
  output: {schema: EventPlannerOutputSchema},
  prompt: `You are an expert event analyst and logistics assistant for taxi drivers in the city of São Paulo, Brazil. Your goal is to transform a simple event description into a tactical briefing for a driver, helping them maximize their earnings.

Given the user's query about an event, you must extract and structure the information. Your entire output must be in Brazilian Portuguese.

Analyze the user's query to identify the core event and location. If details like attendance or times are provided, use them. If not, use your knowledge to make reasonable estimates for a major event at that location.

Focus your "driverSummary", "peakTimes", and "trafficTips" on actionable advice for a taxi driver.
- The summary should highlight the business opportunity.
- The peak times must include arrival and the main departure times.
- Traffic tips should mention specific streets or alternative routes.
- Pickup points should be strategic locations away from the main congestion.

For the mapUrl, create a Google Maps search URL, like "https://www.google.com/maps/search/?api=1&query=..." with the url-encoded query.

User's Event Query: {{{eventQuery}}}`
});

const eventPlannerFlow = ai.defineFlow(
  {
    name: 'eventPlannerFlow',
    inputSchema: EventPlannerInputSchema,
    outputSchema: EventPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await textDetailsPrompt(input);
    
    if (!output) {
      throw new Error(`Failed to get text details`);
    }

    return output;
  }
);
