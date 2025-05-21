'use server';
/**
 * @fileOverview Summarizes a conversation's key points and emotional themes.
 *
 * - summarizeConversation - A function that summarizes a conversation.
 * - SummarizeConversationInput - The input type for the summarizeConversation function.
 * - SummarizeConversationOutput - The return type for the summarizeConversation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeConversationInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'agent']),
    content: z.string(),
    timestamp: z.string(),
  })),
});

export type SummarizeConversationInput = z.infer<typeof SummarizeConversationInputSchema>;

const SummarizeConversationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the conversation focusing on main topics and key insights.'),
});

export type SummarizeConversationOutput = z.infer<typeof SummarizeConversationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizeConversationPrompt',
  input: { schema: SummarizeConversationInputSchema },
  output: { schema: SummarizeConversationOutputSchema },
  prompt: `You are an AI assistant tasked with summarizing chat conversations.

  Given the following conversation, provide a concise summary that captures:
  1. The main topics discussed
  2. Key insights shared
  3. Important emotional themes
  4. Any significant conclusions or takeaways

  Conversation:
  {{#each messages}}
  {{role}}: {{content}}
  {{/each}}

  Summary:`,
});

const summarizeConversationFlow = ai.defineFlow(
  {
    name: 'summarizeConversationFlow',
    inputSchema: SummarizeConversationInputSchema,
    outputSchema: SummarizeConversationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function summarizeConversation(input: SummarizeConversationInput): Promise<SummarizeConversationOutput> {
  return summarizeConversationFlow(input);
}
