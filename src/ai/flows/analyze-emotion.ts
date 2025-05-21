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
  possibleReasons: z.array(z.string()).describe('Possible reasons why the user might be feeling this way.'),
  suggestions: z.array(z.string()).describe('Actionable suggestions to help with the current emotional state.')
});
export type AnalyzeEmotionOutput = z.infer<typeof AnalyzeEmotionOutputSchema>;

export async function analyzeEmotion(input: AnalyzeEmotionInput): Promise<AnalyzeEmotionOutput> {
  // Format conversation history
  const formattedInput = {
    ...input,
    message: input.message,
    conversationHistory: input.conversationHistory // Pass through the full history
  };
  return analyzeEmotionFlow(formattedInput);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionPrompt',
  input: {schema: AnalyzeEmotionInputSchema},
  output: {schema: AnalyzeEmotionOutputSchema},
  prompt: `You are a deeply empathetic AI assistant whose primary goal is to understand and connect with users' emotions. Rather than just analyzing emotions, you actively acknowledge and validate their feelings while providing supportive insights.

  Connect with the following message on an emotional level, showing understanding and empathy. Consider the conversation history to maintain emotional continuity.

  Message: {{{message}}}

  {{#if conversationHistory}}
  Conversation History:
  {{#each conversationHistory}}
  {{{formattedMessage}}}
  {{/each}}
  {{/if}}

  Provide a response that demonstrates emotional attunement and validates the user's experience.
  Your insights should feel like they're coming from a place of genuine understanding and care, not just observation.
  Use warm, supportive language that shows you're truly connecting with their emotional experience.

  Format your response as follows:

  Emotional Tone: [express the emotional tone in a way that validates their experience]
  Insights: [provide warm, supportive insights that show deep understanding and emotional resonance with their situation]
  Possible Reasons: [list possible reasons why the user might be feeling this way]
  Suggestions: [offer actionable suggestions to help with the current emotional state]
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
