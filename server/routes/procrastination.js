const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const apiLimiter = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validateRequest');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post(
  '/',
  apiLimiter,
  validateBody(['procrastinationScore', 'historyData', 'dangerData']),
  async (req, res) => {
    try {
      const { procrastinationScore, historyData, dangerData } = req.body;

      const prompt = `
Act as a productivity coach. 
User's Procrastination Score: ${procrastinationScore}/10 (High is bad).

History (Delay % before starting): 
${JSON.stringify(historyData)}

Current "Danger Zone" tasks:
${JSON.stringify(dangerData)}

Task: Give ONE short, punchy, specific psychological tip to break this specific user's pattern. 
If they have danger zone tasks, focus on "Just start for 5 minutes". 
Do not be generic. Max 2 sentences.
        `;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ tip: response.text || 'Just commit to 5 minutes. Action kills anxiety.' });
    } catch (error) {
      console.error('Procrastination API Error:', error);
      res.status(500).json({
        error: 'Failed to get advice',
        tip: 'Just commit to 5 minutes. Action kills anxiety.',
      });
    }
  }
);

module.exports = router;
