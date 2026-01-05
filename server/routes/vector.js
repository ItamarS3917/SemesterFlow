const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');
const apiLimiter = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validateRequest');

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Supabase (Service Role Key needed for some ops, or just use anon key if RLS allows)
// Actually, we should forward the user's token to Supabase to respect RLS.
// But for now, let's assume we use the service role key or just the standard client if we are doing server-side ops.
// Wait, if we use service role key, we bypass RLS. That's dangerous if we don't verify user ownership manually.
// Better approach: The frontend sends the user's JWT. We use that to create a scoped Supabase client.
// OR: We just do the embedding here and return it? No, that exposes the embedding model usage.
// Let's stick to: Backend does everything. We need to verify the user owns the course.

// For now, let's use the environment variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Or service role if we have it
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to chunk text
function chunkText(text, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// POST /api/vector/add
router.post('/add', apiLimiter, validateBody(['courseId', 'content']), async (req, res) => {
  try {
    const { courseId, content, metadata = {} } = req.body;

    // TODO: Verify user owns the course (requires auth middleware to populate req.user)
    // For now, we proceed.

    const chunks = chunkText(content);
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    for (const chunk of chunks) {
      const result = await embeddingModel.embedContent(chunk);
      const embedding = result.embedding.values;

      // Save to Supabase
      // We need to pass the user's auth token to Supabase to respect RLS?
      // Or we use a service role key and manually check ownership.
      // Since we don't have the user's token easily accessible in this context without auth middleware,
      // we will assume the request is authenticated via the upcoming middleware.

      // If we use the ANON key here, RLS will fail because there is no active user session in this server-side client.
      // We need to set the session or use Service Role.
      // Let's use Service Role for now but we MUST verify ownership.
      // Since we haven't implemented auth middleware yet, this is tricky.
      // But the task says "Secure Backend: Add JWT verification middleware".
      // So I should assume that middleware will exist.

      // Let's assume we will have `req.user` or `req.headers.authorization`.

      // TEMPORARY: Just insert. This might fail RLS if we don't handle auth.
      // But wait, `VectorDB.ts` was doing it from client, so it had the session.
      // If we move to server, we lose the session unless we forward it.

      // Strategy:
      // 1. Receive Bearer token.
      // 2. Create Supabase client with that token.
      // 3. Perform insert.

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
      }

      const supabaseClient = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      });

      const { error } = await supabaseClient.from('course_knowledge').insert({
        course_id: courseId,
        content: chunk,
        embedding,
        metadata,
      });

      if (error) throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Vector Add Error:', error);
    res.status(500).json({ error: 'Failed to add knowledge' });
  }
});

// POST /api/vector/ask
router.post('/ask', apiLimiter, validateBody(['courseId', 'question']), async (req, res) => {
  try {
    const { courseId, question } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // 1. Embed question
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent(question);
    const queryEmbedding = result.embedding.values;

    // 2. Search Supabase
    const { data: contextChunks, error } = await supabaseClient.rpc('match_course_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      filter_course_id: courseId,
    });

    if (error) throw error;

    if (!contextChunks || contextChunks.length === 0) {
      return res.json({
        answer: "I couldn't find any specific information about that in your course materials.",
      });
    }

    const contextText = contextChunks.map((c) => c.content).join('\n\n---\n\n');

    // 3. Generate Answer
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are a helpful study assistant. Answer the user's question based ONLY on the following course materials.
If the answer is not in the context, say "I don't have enough information in the course materials to answer that."

Context:
${contextText}

Question: ${question}
`;

    const chatResult = await chatModel.generateContent(prompt);
    const response = await chatResult.response;
    const text = response.text();

    res.json({ answer: text });
  } catch (error) {
    console.error('Vector Ask Error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

module.exports = router;
