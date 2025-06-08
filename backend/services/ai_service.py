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

def generate_title(messages: List[Dict[str, Any]]) -> str:
    """
    Generate a title based on the conversation content.
    """
    if len(messages) < 2:  # Need at least one back-and-forth
        return "New Chat"
        
    try:
        # Use last 2 messages to understand context
        history_text = "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in messages[-2:]
        ])
        
        prompt = f"""
        Based on this conversation excerpt, generate a very short, clear title (2-5 words) that captures its main topic.
        The title should be concise and descriptive, focusing on the key subject being discussed.

        Conversation:
        {history_text}

        Generate only the title, no other text or formatting.
        """
        
        response = model.generate_content(prompt)
        title = response.text.strip().replace('"', '').replace("'", "")
        return title[:50]  # Limit length
        
    except Exception as e:
        logger.error(f"Error generating title: {str(e)}")
        return "New Chat"

def generate_response(message: str, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a response to the user's message and follow-up questions.
    """
    logger.debug(f"Generating response for message: {message[:100]}...")
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

    # Create the prompt for response generation
    prompt = f"""
    You are a helpful AI assistant answering someone's queries. Generate a response for the following message in the context of this conversation history:
    
    Conversation History:
    {history_text}
    
    Current Message:
    {message}
    
    Please provide a response and follow-up questions in JSON format with this structure:
    {{
        "content": "Your helpful response to the user's message",
        "followUpQuestions": ["2-3 relevant follow-up questions to continue the conversation"]
    }}
    
    Ensure the response is valid JSON and follows this exact structure.
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
            "content": "I apologize, but I'm having a temporary technical difficulty. How can I assist you further?",
            "followUpQuestions": ["Could you please rephrase your question?", "What specific information are you looking for?"]
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