import google.generativeai as genai
from typing import List, Dict, Any
import os
from datetime import datetime

# Configure the Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

def analyze_emotion(message: str, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze the emotional content of a message and provide insights.
    """
    # Prepare conversation history for context
    history_text = "\n".join([
        f"{msg['role'].capitalize()}: {msg['content']}"
        for msg in conversation_history[-20:]  # Last 20 messages for context
    ])

    # Create the prompt for emotion analysis
    prompt = f"""
    Analyze the following message in the context of this conversation history:
    
    Conversation History:
    {history_text}
    
    Current Message:
    {message}
    
    Please provide:
    1. The emotional tone of the message
    2. Key insights about the emotional state
    3. Possible reasons for these emotions
    4. Suggestions for addressing these emotions
    5. Follow-up questions to explore the emotions further
    
    Format your response as a JSON object with these keys:
    - emotionalTone: string
    - insights: string
    - possibleReasons: array of strings
    - suggestions: array of strings
    - followUpQuestions: array of strings
    """

    try:
        response = model.generate_content(prompt)
        # Parse the response and ensure it's in the correct format
        analysis = response.text
        # TODO: Add proper JSON parsing and validation here
        return {
            "emotionalTone": "neutral",  # Placeholder
            "insights": analysis,
            "possibleReasons": ["Reason 1", "Reason 2"],
            "suggestions": ["Suggestion 1", "Suggestion 2"],
            "followUpQuestions": ["Question 1?", "Question 2?"]
        }
    except Exception as e:
        print(f"Error in emotion analysis: {str(e)}")
        return {
            "emotionalTone": "error",
            "insights": "I'm having trouble analyzing the emotions right now.",
            "possibleReasons": [],
            "suggestions": ["Please try again later"],
            "followUpQuestions": []
        }

def suggest_topics() -> List[str]:
    """
    Generate a list of conversation starter topics.
    """
    prompt = """
    Generate 5 conversation starter topics that could help someone explore their emotions.
    The topics should be:
    1. Open-ended
    2. Non-judgmental
    3. Focused on emotional well-being
    4. Easy to respond to
    5. Professional and appropriate
    
    Format your response as a simple list of topics, one per line.
    """

    try:
        response = model.generate_content(prompt)
        topics = response.text.strip().split('\n')
        # Clean up the topics and ensure we have exactly 5
        topics = [t.strip().lstrip('1234567890.- ') for t in topics if t.strip()]
        return topics[:5]  # Ensure we only return 5 topics
    except Exception as e:
        print(f"Error generating topics: {str(e)}")
        return [
            "How are you feeling today?",
            "What's been on your mind lately?",
            "What brings you joy?",
            "What challenges are you facing?",
            "What are you looking forward to?"
        ] 