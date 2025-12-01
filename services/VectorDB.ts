import { GoogleGenerativeAI } from "@google/genai";
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export class VectorDB {
    private embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    private chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    /**
     * Adds knowledge to the vector database for a specific course.
     * Chunks the content, generates embeddings, and saves to Supabase.
     */
    async addKnowledge(courseId: string, content: string, metadata: any = {}) {
        try {
            // 1. Chunk the content (simple chunking for now, can be improved)
            const chunks = this.chunkText(content, 1000); // ~1000 chars per chunk

            for (const chunk of chunks) {
                // 2. Generate embedding
                const result = await this.embeddingModel.embedContent(chunk);
                const embedding = result.embedding.values;

                // 3. Save to Supabase
                const { error } = await supabase
                    .from('course_knowledge')
                    .insert({
                        course_id: courseId,
                        content: chunk,
                        embedding,
                        metadata
                    });

                if (error) throw error;
            }
            return true;
        } catch (error) {
            console.error("Error adding knowledge:", error);
            throw error;
        }
    }

    /**
     * Searches for relevant knowledge chunks based on a query.
     */
    async search(query: string, courseId: string, limit: number = 5) {
        try {
            // 1. Generate embedding for the query
            const result = await this.embeddingModel.embedContent(query);
            const queryEmbedding = result.embedding.values;

            // 2. Search in Supabase using the RPC function
            const { data, error } = await supabase.rpc('match_course_knowledge', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5, // Adjust threshold as needed
                match_count: limit,
                filter_course_id: courseId
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error searching knowledge:", error);
            throw error;
        }
    }

    /**
     * Asks a question about a course, retrieving relevant context and generating an answer.
     */
    async ask(question: string, courseId: string) {
        try {
            // 1. Retrieve relevant context
            const contextChunks = await this.search(question, courseId, 5);

            if (!contextChunks || contextChunks.length === 0) {
                return "I couldn't find any specific information about that in your course materials.";
            }

            const contextText = contextChunks.map((c: any) => c.content).join("\n\n---\n\n");

            // 2. Construct Prompt
            const prompt = `
You are a helpful study assistant. Answer the user's question based ONLY on the following course materials.
If the answer is not in the context, say "I don't have enough information in the course materials to answer that."

Context:
${contextText}

Question: ${question}
`;

            // 3. Generate Answer
            const result = await this.chatModel.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Error asking question:", error);
            throw error;
        }
    }

    /**
     * Helper to split text into chunks
     */
    private chunkText(text: string, chunkSize: number): string[] {
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        return chunks;
    }
}

export const vectorDB = new VectorDB();
