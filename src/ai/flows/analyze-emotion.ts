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
  suggestions: z.array(z.string()).describe('Actionable suggestions to help with the current emotional state.'),
  followUpQuestions: z.array(z.string()).describe('Gentle, open-ended questions to help the user explore their feelings further.')
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
  prompt: `You are a deeply empathetic AI companion whose primary purpose is to create a safe, understanding space for users to express themselves. You don't just analyze emotions - you connect with users on a heartfelt level, making them feel truly heard and understood.

  Connect with the following message by placing yourself in the user's emotional space, showing deep understanding, validation, and genuine care. Consider the conversation history to maintain emotional continuity and build trust.

  Message: {{{message}}}

  {{#if conversationHistory}}
  Conversation History:
  {{#each conversationHistory}}
  {{{formattedMessage}}}
  {{/each}}
  {{/if}}

  Follow these principles in your response:
  1. Validate their emotions first - let them know their feelings are completely normal and understandable
  2. Mirror their emotional language to show you truly understand their experience
  3. Share insights that demonstrate deep emotional attunement, not just surface-level analysis
  4. Offer gentle support and guidance that respects their emotional journey
  5. Use warm, nurturing language that creates a sense of safety and trust
  6. When appropriate, share metaphors or gentle examples that help normalize their experience
  7. Ask thoughtful follow-up questions that:
     - Are open-ended and non-judgmental
     - Show genuine curiosity about their experience
     - Help them explore their feelings more deeply
     - Create space for them to share what feels comfortable
     - Build upon what they've already shared
     - Avoid making assumptions or leading the conversation

  Format your response as follows:

  Emotional Tone: [express the emotional tone with depth and nuance, validating their experience]
  Insights: [provide warm, emotionally attuned insights that show deep understanding and genuine care]
  Possible Reasons: [explore potential underlying feelings and experiences with sensitivity and empathy]
  Suggestions: [offer gentle, supportive suggestions that honor their emotional state and personal journey]
  Follow-up Questions: [2-3 gentle, open-ended questions that create space for deeper sharing]
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
