# SemesterFlow Backend Server

Backend proxy server for SemesterFlow that securely handles AI API calls and protects sensitive API keys.

## Security Features

### API Key Protection
- All AI API keys (GEMINI_API_KEY) are stored server-side only
- Frontend never receives or bundles API keys
- Environment variables are never exposed to client-side code

### Security Headers
- **X-Frame-Options**: DENY - Prevents clickjacking attacks
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-XSS-Protection**: Enabled - Protection against XSS attacks
- **Referrer-Policy**: strict-origin-when-cross-origin - Controls referrer information

### Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **API Rate Limit**: 20 requests per minute per IP for AI endpoints

### Input Validation
- Required field validation on all endpoints
- Payload size limit: 500KB per request
- Prevents oversized or malicious payloads

### CORS Configuration
- Configurable allowed origins via ALLOWED_ORIGINS environment variable
- Default: localhost:5173 (dev) and localhost:4173 (preview)
- Rejects requests from unauthorized domains

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```
   PORT=3000
   GEMINI_API_KEY=your_actual_api_key_here
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Chat
- **POST** `/api/chat` - AI chat with streaming responses

### Grading
- **POST** `/api/grade` - AI-powered assignment grading

### Study Planning
- **POST** `/api/plan` - Generate AI study plans

### Procrastination Analysis
- **POST** `/api/procrastination` - Get procrastination advice

### Study Partner
- **POST** `/api/study-partner/chat` - Interactive study session with streaming
- **POST** `/api/study-partner/concept-map` - Generate concept maps from course materials

### Health Check
- **GET** `/health` - Server health status

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | 3000 |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | - |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins | localhost:5173,localhost:4173 |
| `NODE_ENV` | No | Environment (development/production) | development |

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use environment-specific origins** - Update ALLOWED_ORIGINS for production
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Monitor API usage** - Check for unusual patterns
5. **Use HTTPS in production** - Never expose API keys over HTTP

## Production Deployment

### Frontend Configuration

Set the API base URL in your production frontend `.env`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Backend Configuration

For production deployment:

1. Set `NODE_ENV=production`
2. Configure production ALLOWED_ORIGINS (must include your frontend domain)
3. Use a process manager (PM2, systemd)
4. Enable HTTPS with a reverse proxy (nginx, Apache)
5. Set up monitoring and logging
6. Consider additional security measures:
   - API key rotation
   - Request signing
   - Additional rate limiting
   - IP whitelisting

### Example Production .env

```env
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_production_api_key
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

## Troubleshooting

### CORS Errors
- Verify frontend URL is in ALLOWED_ORIGINS
- Check that protocol (http/https) matches

### Rate Limit Errors
- Reduce request frequency
- Check if multiple users share the same IP

### API Key Errors
- Verify GEMINI_API_KEY is set correctly in `.env`
- Check API key has appropriate permissions
- Ensure API key quota hasn't been exceeded
