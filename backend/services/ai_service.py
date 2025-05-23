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
    Analyze the emotional content of a message and provide insights.
    """
    logger.debug(f"Starting emotion analysis for message: {message[:100]}...")
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

    # Create the prompt for emotion analysis
    prompt = f"""
    Analyze the following message in the context of this conversation history:
    
    Conversation History:
    {history_text}
    
    Current Message:
    {message}
    
    Please provide a JSON response with the following structure:
    {{
        "emotionalTone": "string describing the emotional tone",
        "insights": "string with key insights about the emotional state",
        "possibleReasons": ["reason1", "reason2", "reason3"],
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "followUpQuestions": ["question1?", "question2?", "question3?"]
    }}
    
    Keep responses concise and focused. Ensure the response is valid JSON and follows this exact structure.
    """
    logger.debug(f"Generated prompt: {len(prompt)} characters")

    try:
        logger.debug("Sending request to Gemini model")
        response = model.generate_content(prompt)
        logger.debug("Received response from Gemini model")
        
        # Try to parse the response as JSON
        try:
            # Extract JSON from the response text
            response_text = response.text.strip()
            logger.debug(f"Raw response text: {response_text[:200]}...")
            
            # Find the first { and last } to extract the JSON object
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = response_text[start:end]
                logger.debug(f"Extracted JSON string: {json_str[:200]}...")
                
                analysis = json.loads(json_str)
                logger.info("Successfully parsed JSON response")
                return analysis
            else:
                error_msg = "No JSON object found in response"
                logger.error(f"{error_msg}. Full response: {response_text}")
                raise ValueError(error_msg)
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Raw response that failed to parse: {response.text}")
            logger.error(traceback.format_exc())
            raise

    except Exception as e:
        logger.error(f"Error in emotion analysis: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "emotionalTone": "error",
            "insights": "I'm having trouble analyzing the emotions right now. Please try again.",
            "possibleReasons": ["Technical difficulties with the AI service"],
            "suggestions": ["Please try again in a moment"],
            "followUpQuestions": ["Would you like to try again?"]
        }

def suggest_topics() -> List[str]:
    """
    Generate a list of conversation starter topics.
    """
    logger.debug("Starting topic suggestion generation")
    
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
            "How are you feeling today?",
            "What's been on your mind lately?",
            "What brings you joy?",
            "What challenges are you facing?",
            "What are you looking forward to?"
        ]
        logger.info("Returning default topics due to error")
        return default_topics 