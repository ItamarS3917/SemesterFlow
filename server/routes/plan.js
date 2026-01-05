const express = require('express');
const router = express.Router();
const { GoogleGenAI, Type } = require('@google/genai');
const apiLimiter = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validateRequest');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', apiLimiter, validateBody(['contextData']), async (req, res) => {
  try {
    const { contextData } = req.body;

    const prompt = `
      Act as an expert academic strategist. 
      Current Date: ${contextData.currentDate}
      Available Time: ${contextData.availableHours} hours
      User Focus Request: ${contextData.userFocusRequest}
      Data: ${JSON.stringify(contextData)}

      Generate a highly optimized study plan for TODAY. 
      Rules:
      1. Check course knowledge base for exams/urgent topics.
      2. Prioritize deadlines within 3 days.
      3. Break time into chunks (30-90m).
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            totalMinutes: { type: Type.INTEGER },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  courseId: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
                  reasoning: { type: Type.STRING },
                },
                required: ['courseId', 'activity', 'durationMinutes', 'priority', 'reasoning'],
              },
            },
          },
          required: ['summary', 'sessions', 'totalMinutes'],
        },
      },
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      res.status(500).json({ error: 'Empty response from AI' });
    }
  } catch (error) {
    console.error('Planning API Error:', error);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

module.exports = router;
