import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-topics.ts';
import '@/ai/flows/analyze-emotion.ts';
import '@/ai/flows/summarize-conversation.ts';