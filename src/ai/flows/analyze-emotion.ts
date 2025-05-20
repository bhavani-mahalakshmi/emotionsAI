'use server';

/**
 * @fileOverview A flow for analyzing the emotional tone of user messages and providing insights.
 *
 * - analyzeEmotion - A function that takes a message as input and returns an analysis of the emotional tone.
 * - AnalyzeEmotionInput - The input type for the analyzeEmotion function.
 * - AnalyzeEmotionOutput - The return type for the analyzeEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Register the eq helper
const AnalyzeEmotionInputSchema = z.object({
  message: z.string().describe('The message to analyze for emotional tone.'),
  conversationHistory: z.array(z.object({ // Add conversation history
    role: z.enum(['user', 'agent']),  // Indicate who sent the message
    content: z.string(),               // The message content
    formattedMessage: z.string().optional(), // Optional formatted message
  })).optional().describe('The history of the conversation.'),
});
export type AnalyzeEmotionInput = z.infer<typeof AnalyzeEmotionInputSchema>;

const AnalyzeEmotionOutputSchema = z.object({
  emotionalTone: z.string().describe('The emotional tone of the message.'),
  insights: z.string().describe('Insights into the user\'s feelings.'),
});
export type AnalyzeEmotionOutput = z.infer<typeof AnalyzeEmotionOutputSchema>;

export async function analyzeEmotion(input: AnalyzeEmotionInput): Promise<AnalyzeEmotionOutput> {
  // Format conversation history
  const formattedInput = {
    ...input,
    conversationHistory: input.conversationHistory?.map(msg => ({
      ...msg,
      formattedMessage: `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}`
    }))
  };
  return analyzeEmotionFlow(formattedInput);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionPrompt',
  input: {schema: AnalyzeEmotionInputSchema},
  output: {schema: AnalyzeEmotionOutputSchema},
  prompt: `You are an empathetic AI assistant designed to analyze the emotional tone of messages and provide insights into the user\'s feelings.

  Analyze the following message and provide insights into the user\'s feelings. Consider the conversation history provided.

  Message: {{{message}}}

  {{#if conversationHistory}}
  Conversation History:
  {{#each conversationHistory}}
  {{{formattedMessage}}}
  {{/each}}
  {{/if}}
  
  Provide a brief analysis of the emotional tone and offer some insights into what the user might be feeling.
  Format your response as follows:

  Emotional Tone: [emotional tone]
  Insights: [insights into the user\'s feelings]
  `,
});

const analyzeEmotionFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionFlow',
    inputSchema: AnalyzeEmotionInputSchema,
    outputSchema: AnalyzeEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
