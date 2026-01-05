const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const apiLimiter = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validateRequest');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Study Partner Chat Endpoint
router.post(
  '/chat',
  apiLimiter,
  validateBody(['message', 'history', 'systemInstruction']),
  async (req, res) => {
    try {
      const { message, history, systemInstruction } = req.body;

      // Set headers for SSE (Server-Sent Events) / Streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const chat = genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        },
        history: history,
      });

      const resultStream = await chat.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        const chunkText = chunk.text || '';
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Study Partner Chat API Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process chat request' });
      } else {
        res.end();
      }
    }
  }
);

// Concept Map Generation Endpoint
router.post(
  '/concept-map',
  apiLimiter,
  validateBody(['courseKnowledge', 'courseName']),
  async (req, res) => {
    try {
      const { courseKnowledge, courseName } = req.body;

      const prompt = `
Based on the following course notes for "${courseName}", extract 5-10 key concepts and show how they relate to each other.

Course Content:
${courseKnowledge}

Return ONLY a valid JSON array in this format:
[
  { "id": "concept1", "label": "Short Name", "relatedTo": ["concept2", "concept3"] },
  { "id": "concept2", "label": "Short Name", "relatedTo": ["concept1"] }
]

Rules:
- Use short, descriptive labels (2-4 words max)
- Each concept should connect to at least one other concept
- Limit to 10 concepts maximum
        `;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let conceptMap;
      try {
        // Try to extract JSON from response
        const text = response.text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          conceptMap = JSON.parse(jsonMatch[0]);
        } else {
          conceptMap = [];
        }
      } catch (parseError) {
        console.error('Failed to parse concept map JSON:', parseError);
        conceptMap = [];
      }

      res.json({ conceptMap });
    } catch (error) {
      console.error('Concept Map API Error:', error);
      res.status(500).json({ error: 'Failed to generate concept map', conceptMap: [] });
    }
  }
);

module.exports = router;
