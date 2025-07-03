import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-transcript.ts';
import '@/ai/flows/event-planner-flow.ts';
import '@/ai/flows/generate-blog-post-flow.ts';
import '@/ai/flows/generate-quiz-flow.ts';
