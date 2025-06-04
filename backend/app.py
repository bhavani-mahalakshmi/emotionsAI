from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv
from services.ai_service import analyze_emotion, suggest_topics
from services.conversation_service import (
    create_conversation,
    get_conversation,
    update_conversation,
    delete_conversation,
    list_conversations
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Routes for conversation management
@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    conversations = list_conversations()
    return jsonify(conversations)

@app.route('/api/conversations', methods=['POST'])
def new_conversation():
    conversation_id = create_conversation()
    return jsonify({"id": conversation_id}), 201

@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_single_conversation(conversation_id):
    conversation = get_conversation(conversation_id)
    if not conversation:
        return jsonify({"error": "Conversation not found"}), 404
    return jsonify(conversation)

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def remove_conversation(conversation_id):
    success = delete_conversation(conversation_id)
    if not success:
        return jsonify({"error": "Conversation not found"}), 404
    return jsonify({"message": "Conversation deleted"}), 200

@app.route('/api/conversations/<conversation_id>/title', methods=['PUT'])
def rename_conversation(conversation_id):
    data = request.get_json()
    new_title = data.get('title')
    if not new_title:
        return jsonify({"error": "Title is required"}), 400
    
    success = update_conversation(conversation_id, {"title": new_title})
    if not success:
        return jsonify({"error": "Conversation not found"}), 404
    return jsonify({"message": "Title updated"}), 200

# Routes for messaging
@app.route('/api/conversations/<conversation_id>/messages', methods=['POST'])
def add_message(conversation_id):
    data = request.get_json()
    message_content = data.get('content')
    if not message_content:
        return jsonify({"error": "Message content is required"}), 400

    # Create user message
    user_message = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": message_content,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Get conversation history for context
    conversation = get_conversation(conversation_id)
    if not conversation:
        return jsonify({"error": "Conversation not found"}), 404

    # Analyze emotion and get AI response
    ai_response = analyze_emotion(message_content, conversation['messages'])
    
    # Create AI message
    ai_message = {
        "id": str(uuid.uuid4()),
        "role": "agent",
        "content": ai_response['insights'],  # Main response as content
        "timestamp": datetime.utcnow().isoformat(),
        "analysis": {
            "emotionalTone": ai_response['emotionalTone'],
            # Don't duplicate insights here since it's already in content
            "possibleReasons": ai_response['possibleReasons'],
            "suggestions": ai_response['suggestions'],
            "followUpQuestions": ai_response['followUpQuestions']
        }
    }

    # Update conversation with both messages
    update_conversation(conversation_id, {
        "messages": conversation['messages'] + [user_message, ai_message]
    })

    return jsonify({
        "userMessage": user_message,
        "aiMessage": ai_message
    }), 200

# Route for suggested topics
@app.route('/api/suggested-topics', methods=['GET'])
def get_suggested_topics():
    topics = suggest_topics()
    return jsonify({"topics": topics})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 