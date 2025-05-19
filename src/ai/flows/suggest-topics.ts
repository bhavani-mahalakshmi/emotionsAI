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
  prompt: `You are a helpful AI assistant designed to suggest conversation topics for users who want to discuss their emotions or engage in self-reflection.

  Please provide 5 different conversation topics or prompts that a user could use to start a meaningful discussion about their emotions or personal experiences.
  The topics should be diverse and cover a range of emotional experiences and self-reflection exercises.
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
