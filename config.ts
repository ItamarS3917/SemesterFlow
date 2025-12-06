/**
 * Application Configuration
 * Centralized configuration for API endpoints and other settings
 */

// API Base URL - defaults to localhost for development
// In production, set VITE_API_BASE_URL environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/chat`,
  GRADE: `${API_BASE_URL}/api/grade`,
  PLAN: `${API_BASE_URL}/api/plan`,
  PROCRASTINATION: `${API_BASE_URL}/api/procrastination`,
  STUDY_PARTNER: {
    CHAT: `${API_BASE_URL}/api/study-partner/chat`,
    CONCEPT_MAP: `${API_BASE_URL}/api/study-partner/concept-map`,
  },
} as const;
