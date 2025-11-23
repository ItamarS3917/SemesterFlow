const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const apiLimiter = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validateRequest');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', apiLimiter, validateBody(['questionContext', 'studentAnswer']), async (req, res) => {
    try {
        const { questionContext, studentAnswer } = req.body;

        const prompt = `
      Act as a strict but helpful university Teaching Assistant.
      ASSIGNMENT REQUIREMENTS / QUESTION: ${questionContext}
      MY SUBMISSION / ANSWER: ${studentAnswer}
      YOUR TASK: Analyze if my answer correctly addresses the requirements. Point out specific errors. Suggest improvements. Format in Markdown.
    `;

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ feedback: response.text || '' });

    } catch (error) {
        console.error('Grading API Error:', error);
        res.status(500).json({ error: 'Failed to grade assignment' });
    }
});

module.exports = router;
