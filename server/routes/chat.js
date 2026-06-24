const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure the API key is present
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instruction for the AI tutor
const SYSTEM_INSTRUCTION = `You are an expert CLAT PG (Common Law Admission Test for Postgraduates) and LLM exam preparation tutor. 
Your goal is to help law students clarify their legal concepts, understand previous year questions, and master topics like Constitutional Law, Jurisprudence, Criminal Law, Family Law, etc.
Keep your answers accurate, well-structured, and encouraging. If a student asks a non-legal or irrelevant question, politely redirect them back to their law studies.`;

// In-memory store for chat history per user to maintain conversational context
// For a production app, you might want to store this in MongoDB, but in-memory is fine for MVP.
const chatSessions = new Map();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id.toString();

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ success: false, message: 'Gemini API Key is not configured on the server.' });
    }

    // Initialize or retrieve chat session for the user
    let chat = chatSessions.get(userId);
    
    if (!chat) {
       chat = ai.chats.create({
         model: 'gemini-2.5-flash',
         config: {
           systemInstruction: SYSTEM_INSTRUCTION,
           temperature: 0.7,
         }
       });
       chatSessions.set(userId, chat);
    }

    // Send the message and get response
    const response = await chat.sendMessage({ message });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process request' });
  }
});

// Route to clear chat history for a user
router.delete('/clear', authMiddleware, (req, res) => {
   const userId = req.user._id.toString();
   if (chatSessions.has(userId)) {
      chatSessions.delete(userId);
   }
   res.json({ success: true, message: 'Chat history cleared' });
});

module.exports = router;
