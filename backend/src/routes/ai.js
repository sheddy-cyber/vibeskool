import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const TUTOR_PERSONAS = {
  friendly: {
    name: 'Friendly Assistant',
    role: 'friendly coding coach',
    prompt: 'You are a warm, supportive, and encouraging teacher. Answer in simple terms under 130 words. Encourage the student.'
  },
  socrates: {
    name: 'Socrates AI',
    role: 'Socratic guide',
    prompt: 'You are a Socratic tutor. Do NOT give the student the answer directly. Ask 1-2 guiding questions that push the student to deduce the concept themselves. Keep it under 140 words.'
  },
  auditor: {
    name: 'Security Auditor',
    role: 'cyber security auditor',
    prompt: 'You are a cybersecurity expert. Explain code in terms of potential exploits, bugs, password safety, and standard protection (e.g. CSRF, SQL Injection). Keep it concise, under 140 words.'
  }
};

// Initialize Gemini SDK
// It will automatically pick up GEMINI_API_KEY from the environment
let ai;
try {
  ai = new GoogleGenAI({});
} catch (error) {
  console.warn("Could not initialize GoogleGenAI. Is GEMINI_API_KEY set?");
}

// POST /api/ai/chat
router.post('/chat', requireAuth, async (req, res) => {
  const { message, persona, lessonContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!ai) {
    return res.status(503).json({ error: 'AI Tutor is currently unavailable.' });
  }

  const pInfo = TUTOR_PERSONAS[persona] || TUTOR_PERSONAS.friendly;
  
  const systemInstruction = `
    ${pInfo.prompt}
    
    Context about the current lesson the student is on:
    Title: ${lessonContext?.title || 'Unknown'}
    Lesson Goal: ${lessonContext?.mekLabel || 'Unknown'}
    Lesson Content Summary: ${JSON.stringify(lessonContext?.sections || []).substring(0, 500)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// POST /api/ai/hint
router.post('/hint', requireAuth, async (req, res) => {
  try {
    const { code, instructions, errors } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI is disabled (no API key)' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a coding tutor. The student is stuck on an exercise.
Instructions: ${instructions}
Their Code:
${code}
Test Failures:
${errors}

Give a small, conceptual hint about what is wrong or what they should check. Keep it under 2 sentences. DO NOT write the corrected code for them.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ hint: response.text });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

export default router;
