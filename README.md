# Emotion Insights AI

A web application that helps users explore and understand their emotions through AI-powered conversations.

## Features

1. **Conversations Management**:
   * Create new chats with AI
   * View and manage conversation history
   * Rename and delete conversations
   * Persistent storage in SQLite database

2. **Messaging Interface**:
   * Real-time chat with AI
   * Emotion analysis of messages
   * Suggested conversation topics
   * Message history with timestamps

3. **AI Integration**:
   * Emotion analysis using Google's Gemini AI
   * Contextual responses based on conversation history
   * Suggested topics for starting conversations
   * Professional and empathetic responses

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+ (for local development)
- Google AI API key
- Docker and Docker Compose (for containerized setup)

## Setup

### Option 1: Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emotionsAI
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory with your Google AI API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

### Option 2: Docker Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emotionsAI
   ```

2. Create a `.env` file in the root directory with your Google AI API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

## Running the Application

### Option 1: Local Development

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on http://localhost:5001

2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

### Option 2: Docker

1. Start all services:
   ```bash
   docker-compose up
   ```
   The frontend will be available at http://localhost:3000
   The backend will be available at http://localhost:5001

2. To stop the services:
   ```bash
   docker-compose down
   ```

3. Open http://localhost:3000 in your browser to use the application

## Development

- Frontend code is in the `src` directory
- Backend code is in the `backend` directory
- SQLite database is stored in `backend/conversations.db`

## API Endpoints

- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/:id` - Get a specific conversation
- `DELETE /api/conversations/:id` - Delete a conversation
- `PUT /api/conversations/:id/title` - Rename a conversation
- `POST /api/conversations/:id/messages` - Add a message to a conversation
- `GET /api/suggested-topics` - Get suggested conversation topics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

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

Connect with me on [LinkedIn](https://www.linkedin.com/in/bhavani-mahalakshmi-gowri-sankar-6b6a54119/)
