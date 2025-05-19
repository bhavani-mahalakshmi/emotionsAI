# Firebase Studio - Emotion Insights App

This is a NextJS starter in Firebase Studio, enhanced to create an "Emotion Insights" chat application.

## Core Logic

The application allows users to engage in conversations with an AI assistant. The primary features include:

1.  **Conversations Management**:
    *   Users can create new chats. Each new chat is automatically given a title based on the creation time.
    *   Existing conversations are listed in a sidebar, showing the title and a snippet of the last message.
    *   Users can select a conversation to view its full message history.
    *   Conversations can be renamed and deleted.
    *   Conversation data (including messages, titles, and timestamps) is persisted in the browser's `localStorage`.

2.  **Messaging Interface**:
    *   A familiar chat interface where users can type and send messages.
    *   Messages from the user and the AI agent are displayed in distinct bubbles.
    *   The AI's response includes an analysis of the emotional tone of the user's message and related insights.

3.  **AI Integration (Genkit)**:
    *   **Emotion Analysis**: When a user sends a message, it (along with recent conversation history for context) is sent to a Genkit flow (`analyzeEmotionFlow`). This flow uses an AI model to:
        *   Determine the emotional tone of the user's message.
        *   Provide insights based on the detected emotion and message content.
    *   **Suggested Topics**:
        *   When the app loads without an active conversation, or when a new, empty chat is created, a Genkit flow (`suggestTopicsFlow`) is called to generate a list of conversation starter topics.
        *   These topics are displayed to the user to help them initiate a discussion.
    *   **Context Management**: The application sends the last `AI_MESSAGE_HISTORY_LIMIT` (currently 20) messages to the AI to provide context for its responses. Warnings are displayed if the conversation approaches or exceeds this limit.

4.  **User Interface (Next.js, React, ShadCN UI, Tailwind CSS)**:
    *   The application uses a responsive layout with a collapsible sidebar for conversation navigation and a main area for chat display.
    *   ShadCN UI components are used for building the user interface elements (buttons, cards, input fields, etc.).
    *   Tailwind CSS is used for styling.
    *   The UI provides visual feedback for loading states (e.g., when waiting for an AI response or fetching suggested topics).
    *   Toast notifications are used for system messages (e.g., errors, context limit warnings).

5.  **State Management**:
    *   React Context (`ConversationsContext`) is used to manage the global state of conversations, active chat, loading states, and suggested topics.

## Getting Started

To get started, take a look at `src/app/page.tsx` which initializes the main application layout and context provider. The core UI components are in `src/components/`, and AI flows are located in `src/ai/flows/`.

---

Copyright © 2025 Bhavani Mahalakshmi Gowri Sankar. All rights reserved.

Connect with me on [LinkedIn](https://www.linkedin.com/in/your-profile-url-here/)
