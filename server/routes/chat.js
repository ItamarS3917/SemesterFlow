const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const apiLimiter = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validateRequest');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', apiLimiter, validateBody(['message', 'history']), async (req, res) => {
    try {
        const { message, history, systemInstruction, stream = true } = req.body;

        const chat = genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction || "You are a helpful study assistant.",
            },
            history: history
        });

        if (stream) {
            // Set headers for SSE (Server-Sent Events) / Streaming
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const resultStream = await chat.sendMessageStream({ message });

            for await (const chunk of resultStream) {
                const chunkText = chunk.text || '';
                res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } else {
            // Non-streaming response
            const result = await chat.sendMessage({ message });
            const response = await result.response;
            const text = response.text();
            res.json({ text });
        }

    } catch (error) {
        console.error('Chat API Error:', error);
        // If headers are already sent, we can't send a JSON error response
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process chat request' });
        } else {
            res.end();
        }
    }
});

module.exports = router;
