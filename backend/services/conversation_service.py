import sqlite3
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import os
import uuid

# Database configuration
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
DB_PATH = os.path.join(DB_DIR, 'conversations.db')

def init_db():
    """Initialize the database with required tables."""
    # Create data directory if it doesn't exist
    os.makedirs(DB_DIR, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Create conversations table
    c.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    ''')
    
    # Create messages table
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            analysis TEXT,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_conversation() -> Dict[str, Any]:
    """Create a new conversation and return its complete object."""
    conversation_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    title = f"Chat - {datetime.utcnow().strftime('%H:%M')}"
    
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute(
            'INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
            (conversation_id, title, now, now)
        )
        
        conn.commit()
        
        # Verify the conversation was created
        c.execute('SELECT id FROM conversations WHERE id = ?', (conversation_id,))
        if not c.fetchone():
            raise Exception("Failed to verify conversation creation")
            
        # Return a complete conversation object with an empty messages array
        return {
            "id": conversation_id,
            "title": title,
            "createdAt": now,
            "updatedAt": now,
            "messages": [],
            "lastMessage": None,
            "lastMessageTime": None
        }
    finally:
        conn.close()

def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get a conversation by ID with its messages."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get conversation details
    c.execute('SELECT * FROM conversations WHERE id = ?', (conversation_id,))
    conv = c.fetchone()
    
    if not conv:
        conn.close()
        return None
    
    # Get messages
    c.execute('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp', (conversation_id,))
    messages = c.fetchall()
    
    conn.close()
    
    # Format conversation
    conversation = {
        "id": conv[0],
        "title": conv[1],
        "createdAt": conv[2],
        "updatedAt": conv[3],
        "messages": [
            {
                "id": msg[0],
                "role": msg[2],
                "content": msg[3],
                "timestamp": msg[4],
                "analysis": json.loads(msg[5]) if msg[5] else None
            }
            for msg in messages
        ]
    }
    
    return conversation

def update_conversation(conversation_id: str, updates: Dict[str, Any]) -> bool:
    """Update a conversation's details."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if conversation exists
    c.execute('SELECT id FROM conversations WHERE id = ?', (conversation_id,))
    if not c.fetchone():
        conn.close()
        return False
    
    # Update conversation
    if 'title' in updates:
        c.execute(
            'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?',
            (updates['title'], datetime.utcnow().isoformat(), conversation_id)
        )
    
    # Update messages if provided
    if 'messages' in updates:
        # Delete existing messages
        c.execute('DELETE FROM messages WHERE conversation_id = ?', (conversation_id,))
        
        # Insert new messages
        for msg in updates['messages']:
            c.execute(
                '''INSERT INTO messages 
                   (id, conversation_id, role, content, timestamp, analysis)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (
                    msg['id'],
                    conversation_id,
                    msg['role'],
                    msg['content'],
                    msg['timestamp'],
                    json.dumps(msg.get('analysis')) if 'analysis' in msg else None
                )
            )
    
    conn.commit()
    conn.close()
    return True

def delete_conversation(conversation_id: str) -> bool:
    """Delete a conversation and its messages."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if conversation exists
    c.execute('SELECT id FROM conversations WHERE id = ?', (conversation_id,))
    if not c.fetchone():
        conn.close()
        return False
    
    # Delete messages first (due to foreign key constraint)
    c.execute('DELETE FROM messages WHERE conversation_id = ?', (conversation_id,))
    
    # Delete conversation
    c.execute('DELETE FROM conversations WHERE id = ?', (conversation_id,))
    
    conn.commit()
    conn.close()
    return True

def list_conversations() -> List[Dict[str, Any]]:
    """List all conversations with their latest message."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get all conversations with their latest message
    c.execute('''
        SELECT c.*, m.content, m.timestamp
        FROM conversations c
        LEFT JOIN messages m ON c.id = m.conversation_id
        WHERE m.id IN (
            SELECT id
            FROM messages
            WHERE conversation_id = c.id
            ORDER BY timestamp DESC
            LIMIT 1
        )
        OR m.id IS NULL
        ORDER BY c.updated_at DESC
    ''')
    
    conversations = []
    for row in c.fetchall():
        conversation = {
            "id": row[0],
            "title": row[1],
            "createdAt": row[2],
            "updatedAt": row[3],
            "lastMessage": row[4] if row[4] else None,
            "lastMessageTime": row[5] if row[5] else None
        }
        conversations.append(conversation)
    
    conn.close()
    return conversations

# Initialize the database when the module is imported
init_db() 