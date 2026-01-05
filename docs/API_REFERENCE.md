# API Reference - SemesterFlow Backend

> **Base URL (Development)**: `http://localhost:3000`
> **Base URL (Production)**: TBD (deploy to Render/Railway)
> **Last Updated**: December 1, 2025

---

## Overview

The SemesterFlow backend is an Express.js server that provides AI-powered features via the Gemini API. It acts as a secure proxy to keep API keys server-side and handle rate limiting.

**Tech Stack**:

- Express.js 4.x
- Google Generative AI SDK
- CORS enabled for frontend
- Rate limiting per IP

---

## Authentication

**No authentication required** - The backend is stateless and relies on the frontend to pass user context in request bodies. Authentication is handled by Supabase on the frontend.

⚠️ **Security Note**: In production, consider adding API key authentication to prevent abuse.

---

## Endpoints

### 1. POST /api/chat

**Purpose**: AI chatbot conversation with context awareness

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "message": "What's my next exam?",
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "Previous message from user" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Previous AI response" }]
    }
  ],
  "systemInstruction": "You are the AI Study Assistant for SemesterFlow..."
}
```

**Request Parameters**:

| Field               | Type   | Required | Description                          |
| ------------------- | ------ | -------- | ------------------------------------ |
| `message`           | string | Yes      | User's current message               |
| `history`           | array  | No       | Previous chat messages for context   |
| `systemInstruction` | string | Yes      | System prompt with user data context |

**Response**: Server-Sent Events (SSE) stream

```
data: {"text": "Your"}

data: {"text": " next"}

data: {"text": " exam"}

data: {"text": " is"}

data: {"text": " on"}

data: {"text": " Friday"}

data: [DONE]
```

**Response Format**:

- **Content-Type**: `text/event-stream`
- Each chunk is prefixed with `data: `
- Streaming continues until `[DONE]` marker
- Frontend concatenates chunks to build full response

**Example Usage** (Frontend):

```typescript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userText,
    history: chatHistory,
    systemInstruction: systemPrompt,
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let fullText = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const dataStr = line.slice(6);
      if (dataStr === '[DONE]') break;

      const data = JSON.parse(dataStr);
      if (data.text) {
        fullText += data.text;
        // Update UI with fullText
      }
    }
  }
}
```

**Error Responses**:

```json
{
  "error": "Message is required"
}
```

**Status Codes**:

- `200 OK` - Streaming started successfully
- `400 Bad Request` - Missing or invalid parameters
- `500 Internal Server Error` - Gemini API error

---

### 2. POST /api/plan

**Purpose**: Generate personalized daily study plan using AI

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "contextData": {
    "currentDate": "12/1/2025",
    "availableHours": 3,
    "userFocusRequest": "Review for Algebra exam",
    "courses": [
      {
        "id": "ALGEBRA",
        "name": "Linear Algebra",
        "progressPercentage": 65,
        "targetHours": 100,
        "completedHours": 65,
        "nextExamDate": "2025-12-05T09:00:00Z",
        "knowledgeBase": "Course covers matrices, vectors..."
      }
    ],
    "assignments": [
      {
        "courseId": "ALGEBRA",
        "name": "Problem Set 5",
        "due": "2025-12-03T23:59:00Z",
        "estHours": 3
      }
    ]
  }
}
```

**Request Parameters**:

| Field                          | Type   | Required | Description                    |
| ------------------------------ | ------ | -------- | ------------------------------ |
| `contextData.currentDate`      | string | Yes      | Today's date                   |
| `contextData.availableHours`   | number | Yes      | Hours available to study today |
| `contextData.userFocusRequest` | string | No       | Specific topic to focus on     |
| `contextData.courses`          | array  | Yes      | User's courses with progress   |
| `contextData.assignments`      | array  | Yes      | Upcoming assignments           |

**Response** (JSON):

```json
{
  "date": "12/1/2025",
  "summary": "Focus on Algebra exam prep with Problem Set 5 priority. Balance review with new material.",
  "sessions": [
    {
      "id": "plan-0",
      "courseId": "ALGEBRA",
      "activity": "Complete Problem Set 5",
      "durationMinutes": 90,
      "priority": "HIGH",
      "reasoning": "Due in 2 days, exam in 4 days. Completing this will solidify exam topics."
    },
    {
      "id": "plan-1",
      "courseId": "ALGEBRA",
      "activity": "Review Chapter 4: Eigenvectors",
      "durationMinutes": 60,
      "priority": "HIGH",
      "reasoning": "Exam in 4 days. This is a weak concept identified earlier."
    },
    {
      "id": "plan-2",
      "courseId": "ALGEBRA",
      "activity": "Practice exam questions",
      "durationMinutes": 30,
      "priority": "MEDIUM",
      "reasoning": "Active recall for exam readiness."
    }
  ],
  "totalMinutes": 180
}
```

**Response Fields**:

| Field                        | Type   | Description                    |
| ---------------------------- | ------ | ------------------------------ |
| `date`                       | string | Date this plan is for          |
| `summary`                    | string | Overall strategy for the day   |
| `sessions`                   | array  | List of planned study sessions |
| `sessions[].id`              | string | Unique session ID              |
| `sessions[].courseId`        | string | Related course                 |
| `sessions[].activity`        | string | What to study                  |
| `sessions[].durationMinutes` | number | Suggested duration             |
| `sessions[].priority`        | string | HIGH \| MEDIUM \| LOW          |
| `sessions[].reasoning`       | string | Why AI suggests this           |
| `totalMinutes`               | number | Sum of all session durations   |

**Error Responses**:

```json
{
  "error": "contextData is required"
}
```

**Status Codes**:

- `200 OK` - Plan generated successfully
- `400 Bad Request` - Missing contextData
- `500 Internal Server Error` - Gemini API error

---

### 3. POST /api/grade

**Purpose**: Auto-grade assignments (future implementation)

**Status**: ⚠️ Schema defined, endpoint exists, but **not yet implemented**

**Planned Request**:

```json
{
  "assignmentId": "uuid",
  "studentSubmission": "Text or file URL",
  "rubric": {
    "criteria": ["correctness", "clarity", "completeness"],
    "maxScore": 100
  }
}
```

**Planned Response**:

```json
{
  "score": 85,
  "feedback": "Good work! Consider...",
  "breakdown": {
    "correctness": 30/30,
    "clarity": 25/30,
    "completeness": 30/40
  }
}
```

**Current Status**: Returns `501 Not Implemented`

---

## Rate Limiting

### Current Configuration

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
```

**Limits**:

- 100 requests per 15 minutes per IP address
- Applies to all endpoints

**Exceeding Limit**:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

**Status Code**: `429 Too Many Requests`

---

## CORS Configuration

**Allowed Origins** (Development):

```javascript
const corsOptions = {
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
};
```

**Allowed Origins** (Production):
Update `server/index.js` to include production frontend URL:

```javascript
const corsOptions = {
  origin: ['https://your-domain.com', 'http://localhost:5173'],
  credentials: true,
};
```

---

## Error Handling

### Standard Error Response

All errors return this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common Errors

| Status | Error                     | Cause                                 |
| ------ | ------------------------- | ------------------------------------- |
| 400    | "Message is required"     | Missing `message` in /api/chat        |
| 400    | "contextData is required" | Missing `contextData` in /api/plan    |
| 429    | "Too many requests..."    | Rate limit exceeded                   |
| 500    | "Internal server error"   | Gemini API failure                    |
| 501    | "Not implemented"         | Endpoint not ready (e.g., /api/grade) |

---

## Environment Variables (Backend)

### Required

```bash
# .env (in server/ directory)
GEMINI_API_KEY=AIzaSyC...your_key_here
PORT=3000  # Optional, defaults to 3000
```

### Getting Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key and add to `server/.env`

---

## Local Development

### Starting the Server

```bash
cd server
npm install
npm start
```

**Output**:

```
Server running on http://localhost:3000
Rate limiting enabled: 100 requests per 15 minutes
```

### Testing Endpoints

#### Using curl

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "systemInstruction": "You are a helpful assistant."
  }'

# Test plan endpoint
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "contextData": {
      "currentDate": "12/1/2025",
      "availableHours": 3,
      "courses": [],
      "assignments": []
    }
  }'
```

#### Using Postman

1. Set method to POST
2. URL: `http://localhost:3000/api/chat`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON): Paste request examples above

---

## Production Deployment

### Environment Variables

Set these on your hosting platform (Render/Railway):

```bash
GEMINI_API_KEY=your_production_key
PORT=3000
NODE_ENV=production
```

### CORS Update

Update `server/index.js`:

```javascript
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
```

### Health Check Endpoint

**GET /**

Returns server status:

```json
{
  "status": "ok",
  "message": "SemesterFlow API is running"
}
```

Use this for monitoring and health checks.

---

## Future Enhancements

### Planned Features

1. **Authentication**
   - Add API key authentication
   - JWT token validation
   - User-specific rate limiting

2. **Caching**
   - Redis cache for repeated queries
   - Reduce Gemini API costs

3. **WebSockets**
   - Real-time chat instead of SSE
   - Better for mobile apps

4. **Batch Endpoints**
   - Process multiple requests in one call
   - Reduce network overhead

5. **Analytics**
   - Track usage per user
   - Monitor API costs
   - Performance metrics

---

## Troubleshooting

### "CORS error"

**Cause**: Frontend URL not in allowed origins
**Fix**: Update CORS config in `server/index.js`

### "Gemini API error"

**Cause**: Invalid API key or quota exceeded
**Fix**: Check `.env` file, verify key at https://aistudio.google.com

### "Too many requests"

**Cause**: Rate limit exceeded
**Fix**: Wait 15 minutes or increase limit in `server/middleware/rateLimiter.js`

### "Connection refused"

**Cause**: Server not running
**Fix**: Run `npm start` in `server/` directory

---

**Last Updated**: December 1, 2025
**Maintained By**: Development Team
