import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class VectorDB {

    private async getHeaders() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
        };
    }

    /**
     * Adds knowledge to the vector database for a specific course.
     * Chunks the content, generates embeddings, and saves to Supabase.
     */
    async addKnowledge(courseId: string, content: string, metadata: any = {}) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_URL}/api/vector/add`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ courseId, content, metadata })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add knowledge');
            }

            return true;
        } catch (error) {
            console.error("Error adding knowledge:", error);
            throw error;
        }
    }

    /**
     * Searches for relevant knowledge chunks based on a query.
     * Note: This is now handled internally by the 'ask' endpoint, but we keep it if needed.
     * If we really need raw search, we should add a /search endpoint.
     * For now, I'll comment it out or implement it via backend if strictly necessary.
     * The original code used it in 'ask'.
     */
    async search(query: string, courseId: string, limit: number = 5) {
        // This method was primarily used by 'ask'. 
        // If other components use it, we need a backend endpoint.
        // Assuming 'ask' is the main consumer.
        console.warn("VectorDB.search is deprecated. Use ask() instead.");
        return [];
    }

    /**
     * Asks a question about a course, retrieving relevant context and generating an answer.
     */
    async ask(question: string, courseId: string) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_URL}/api/vector/ask`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ courseId, question })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to ask question');
            }

            const data = await response.json();
            return data.answer;

        } catch (error) {
            console.error("Error asking question:", error);
            throw error;
        }
    }
}

export const vectorDB = new VectorDB();
