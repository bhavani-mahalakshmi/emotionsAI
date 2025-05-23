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
    Analyze the emotional content of a message and provide insights with empathy.
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

    # Create the prompt for emotion analysis with a more empathetic approach
    prompt = f"""
    You are an empathetic AI assistant helping someone explore their emotions. Analyze the following message in the context of this conversation history:
    
    Conversation History:
    {history_text}
    
    Current Message:
    {message}
    
    Please provide a warm, understanding response that:
    1. Acknowledges the person's feelings
    2. Shows genuine care and empathy
    3. Offers gentle insights and support
    4. Encourages further exploration of emotions
    
    Please provide a JSON response with the following structure:
    {{
        "emotionalTone": "A warm, empathetic description of the emotional tone",
        "insights": "A caring and supportive insight about their emotional state",
        "possibleReasons": ["A gentle exploration of possible reasons for their feelings"],
        "suggestions": ["Supportive suggestions for emotional well-being"],
        "followUpQuestions": ["Open-ended, caring questions to continue the conversation"]
    }}
    
    Keep responses warm and conversational while maintaining professionalism. Ensure the response is valid JSON and follows this exact structure.
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
            "emotionalTone": "concerned and supportive",
            "insights": "I'm here to listen and support you. I'm having a moment of difficulty, but I'm still here for you. Would you like to share more about how you're feeling?",
            "possibleReasons": ["I'm experiencing a temporary technical difficulty, but I'm still here to support you"],
            "suggestions": ["Let's continue our conversation - I'm here to listen and support you"],
            "followUpQuestions": ["How are you feeling right now?", "Would you like to tell me more about what's on your mind?", "What would be most helpful for you right now?"]
        }

def suggest_topics() -> List[str]:
    """
    Generate a list of warm and empathetic conversation starter topics.
    """
    logger.debug("Starting topic suggestion generation")
    
    prompt = """
    Generate 5 warm and empathetic conversation starter topics that could help someone explore their emotions.
    The topics should be:
    1. Warm and inviting, showing genuine care and interest
    2. Open-ended to encourage sharing
    3. Non-judgmental and supportive
    4. Focused on emotional well-being and personal growth
    5. Gentle and easy to respond to
    6. Professional while maintaining a caring tone
    
    Each topic should feel like a caring friend reaching out to check in.
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
            "I'd love to know how you're feeling today. Would you like to share?",
            "What's been bringing you joy or peace lately?",
            "I'm here to listen. What's been on your mind?",
            "How are you taking care of yourself these days?",
            "What's something you're looking forward to?"
        ]
        logger.info("Returning default topics due to error")
        return default_topics 