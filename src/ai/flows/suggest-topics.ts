'use server';

/**
 * @fileOverview Provides suggested conversation topics for users who are unsure what to discuss.
 *
 * - `suggestTopics`: A function that generates conversation topics.
 * - `SuggestTopicsInput`: The input type for the `suggestTopics` function (currently empty).
 * - `SuggestTopicsOutput`: The return type for the `suggestTopics` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTopicsInputSchema = z.object({});
export type SuggestTopicsInput = z.infer<typeof SuggestTopicsInputSchema>;

const SuggestTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('An array of suggested conversation topics or prompts.'),
});
export type SuggestTopicsOutput = z.infer<typeof SuggestTopicsOutputSchema>;

export async function suggestTopics(input: SuggestTopicsInput): Promise<SuggestTopicsOutput> {
  return suggestTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTopicsPrompt',
  input: {schema: SuggestTopicsInputSchema},
  output: {schema: SuggestTopicsOutputSchema},
  prompt: `You are an empathetic AI assistant designed to help users explore and express their emotions through meaningful conversation.

  Please provide 5 different conversation starters that invite users to share their feelings and experiences in a safe, supportive space. The topics should:
  - Be phrased in a warm, inviting way that makes users feel comfortable opening up
  - Focus on emotional experiences and personal growth
  - Encourage self-reflection while maintaining a supportive tone
  - Be specific enough to spark meaningful discussion but open-ended enough to allow for personal interpretation
  - Validate that all emotions are welcome and normal to experience

  Format the output as a JSON array of strings.
  `,
});

const suggestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestTopicsFlow',
    inputSchema: SuggestTopicsInputSchema,
    outputSchema: SuggestTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
