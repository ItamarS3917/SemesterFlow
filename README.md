<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1JNTZYuey78dktn8yWcoiwYYp4W5gXNIY

## Run Locally

**Prerequisites:**  Node.js

### 1. Backend Server (Required for AI features)
The backend handles secure API calls to Gemini.

1. Navigate to the server directory:
   `cd server`
2. Install dependencies:
   `npm install`
3. Create a `.env` file in the `server` directory based on `.env.example` and add your `GEMINI_API_KEY`.
4. Start the server:
   `npm start`
   (Runs on http://localhost:3000)

### 2. Frontend Application

1. Install dependencies (root directory):
   `npm install`
2. Create a `.env` file in the root directory based on `.env.example` (for Firebase config).
3. Run the app:
   `npm run dev`
   (Runs on http://localhost:5173)

## Deployment

### Backend
Deploy the `server` directory to a Node.js hosting provider (e.g., Render, Railway, Vercel).
- **Render/Railway:** Connect your repo and set the root directory to `server`. Add `GEMINI_API_KEY` environment variable.
- **Vercel:** You may need to configure `vercel.json` to deploy the express app as a serverless function or use a separate repo for the backend.

### Frontend
Deploy the root directory to Vercel, Netlify, or Firebase Hosting.
- Ensure you set the `VITE_FIREBASE_*` environment variables in your deployment settings.
