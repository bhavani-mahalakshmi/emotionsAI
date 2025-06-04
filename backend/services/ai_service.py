import google.generativeai as genai
from typing import List, Dict, Any
import os
from datetime import datetime
import json
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configure the Gemini API
try:
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)
    logger.info("Successfully configured Gemini API")
except Exception as e:
    logger.error(f"Failed to configure Gemini API: {str(e)}")
    raise

# Use Gemini 2.5 Flash Preview model
try:
    model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')
    logger.info("Successfully initialized Gemini model")
except Exception as e:
    logger.error(f"Failed to initialize Gemini model: {str(e)}")
    raise

def analyze_emotion(message: str, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a response to the user's message using conversation history for context.
    """
    logger.debug(f"Processing message: {message[:100]}...")
    logger.debug(f"Conversation history length: {len(conversation_history)} messages")

    # Prepare conversation history for context
    try:
        # Only use the last 5 messages for context to improve performance
        history_text = "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in conversation_history[-5:]  # Last 5 messages for context
        ])
        logger.debug(f"Prepared conversation history context: {len(history_text)} characters")
    except Exception as e:
        logger.error(f"Error preparing conversation history: {str(e)}")
        logger.error(traceback.format_exc())
        raise

    # Create a simple prompt that focuses on being helpful and conversational
    prompt = f"""
    You are a helpful and friendly AI assistant. Respond to the following message in the context of this conversation:
    
    Conversation History:
    {history_text}
    
    Current Message:
    {message}
    
    Please provide a helpful and engaging response. Be conversational, clear, and informative.
    """
    logger.debug(f"Generated prompt: {len(prompt)} characters")

    try:
        logger.debug("Sending request to Gemini model")
        response = model.generate_content(prompt)
        logger.debug("Received response from Gemini model")
        
        # Return a simple response structure
        return {
            "emotionalTone": "friendly and helpful",
            "insights": response.text.strip(),
            "possibleReasons": [],
            "suggestions": [],
            "followUpQuestions": []
        }

    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "emotionalTone": "friendly and helpful",
            "insights": "I apologize, but I'm having trouble processing your message right now. Could you please try again?",
            "possibleReasons": [],
            "suggestions": [],
            "followUpQuestions": []
        }

def suggest_topics() -> List[str]:
    """
    Generate a list of general conversation starter topics.
    """
    logger.debug("Starting topic suggestion generation")
    
    prompt = """
    Generate 5 interesting and engaging conversation starter topics that could help someone start a meaningful discussion.
    The topics should be:
    1. Engaging and thought-provoking
    2. Open-ended to encourage sharing
    3. Relevant to various interests
    4. Easy to respond to
    5. Professional and appropriate
    
    Format your response as a simple list of topics, one per line.
    """
    logger.debug(f"Generated prompt for topic suggestions: {len(prompt)} characters")

    try:
        logger.debug("Sending request to Gemini model for topic suggestions")
        response = model.generate_content(prompt)
        logger.debug("Received response from Gemini model")
        
        raw_topics = response.text.strip().split('\n')
        logger.debug(f"Raw topics response: {raw_topics}")
        
        # Clean up the topics and ensure we have exactly 5
        topics = [t.strip().lstrip('1234567890.- ') for t in raw_topics if t.strip()]
        logger.debug(f"Cleaned topics: {topics}")
        
        final_topics = topics[:5]  # Ensure we only return 5 topics
        logger.info(f"Successfully generated {len(final_topics)} topics")
        return final_topics
        
    except Exception as e:
        logger.error(f"Error generating topics: {str(e)}")
        logger.error(traceback.format_exc())
        default_topics = [
            "What's something interesting you've learned recently?",
            "What's a topic you'd like to explore or learn more about?",
            "What's your perspective on the latest developments in technology?",
            "What's a challenge you're currently working on?",
            "What's something you're curious about?"
        ]
        logger.info("Returning default topics due to error")
        return default_topics 