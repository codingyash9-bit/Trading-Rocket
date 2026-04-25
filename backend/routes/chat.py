"""
Chat Routes - Gemini API Version
Uses Google's Gemini for AI responses
"""
import asyncio
import os
import PIL.Image
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None

router = APIRouter()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
if GEMINI_API_KEY and GEMINI_AVAILABLE:
    genai.configure(api_key=GEMINI_API_KEY)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def chat(request: ChatRequest, user_id: Optional[str] = None):
    """Chat with Gemini AI"""
    message = request.message
    
    if not message or len(message.strip()) < 2:
        return {"success": False, "message": {"content": "Please provide a valid message."}, "error": "Empty message"}
    
    if not GEMINI_API_KEY or GEMINI_AVAILABLE is False:
        return {"success": False, "message": {"content": "Gemini not configured."}, "error": "Config missing"}
    
    try:
        system_prompt = """You are an Indian stock market assistant."""
        
        contents = [system_prompt]
        
        # Multimodal Context
        if user_id:
            photo_path = f"user_data/photos/{user_id}.jpg"
            if os.path.exists(photo_path):
                try:
                    img = PIL.Image.open(photo_path)
                    contents.append(img)
                except: pass
        
        # History
        if request.history:
            for msg in request.history[-5:]:
                contents.append(f"{msg.role}: {msg.content}")
        
        contents.append(f"User: {message}")
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = await asyncio.wait_for(
            asyncio.to_thread(lambda: model.generate_content(contents)),
            timeout=30.0
        )
        
        ai_response = response.text if hasattr(response, 'text') else str(response)
        
        return {
            "success": True,
            "message": {"content": ai_response, "timestamp": str(asyncio.get_event_loop().time())},
            "sources": ["Gemini AI"]
        }
            
    except Exception as e:
        return {"success": False, "message": {"content": f"Chat error: {str(e)[:100]}"}, "error": str(e)}

@router.get("/chat/quick")
async def quick_chat(message: str):
    return await chat(ChatRequest(message=message))
