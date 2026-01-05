# Deployment Guide - SemesterFlow

> **Target**: Production deployment on Vercel (Frontend) + Render (Backend) + Supabase (Database)
> **Est. Time**: 30-45 minutes
> **Last Updated**: December 1, 2025

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (free tier)
- [ ] Render account (free tier)
- [ ] Supabase account (free tier)
- [ ] Google Cloud account (for OAuth)
- [ ] Domain name (optional, but recommended)

---

## Deployment Architecture

```
┌─────────────────────────┐
│   Custom Domain         │
│   (your-app.com)        │
└───────────┬─────────────┘
            │
    ┌───────▼──────────────────────┐
    │  Vercel (Frontend)           │
    │  React + TypeScript          │
    │  https://your-app.vercel.app │
    └───────┬──────────────────────┘
            │
    ┌───────▼───────┬──────────────────┐
    │               │                  │
┌───▼────┐    ┌────▼─────┐    ┌──────▼──────┐
│Supabase│    │ Render   │    │   Google    │
│Database│    │ Backend  │    │ Gemini API  │
│ + Auth │    │ Express  │    │             │
└────────┘    └──────────┘    └─────────────┘
```

---

## Phase 1: Supabase Setup (Database & Auth)

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: `semesterflow-prod`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait ~2 minutes for provisioning

### Step 1.2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase_schema.sql`
4. Paste into editor
5. Click **Run** (bottom right)
6. Verify success: Check **Database > Tables** - should see `courses`, `assignments`, `sessions`, `user_stats`, `course_knowledge`

### Step 1.3: Get API Credentials

1. Go to **Settings > API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGci...` (long token)
3. Save these for later (you'll need them in Vercel)

### Step 1.4: Configure Google OAuth

#### A. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `SemesterFlow Production`
7. **Authorized redirect URIs**: Add your Supabase callback URL
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR_PROJECT_REF` with your Supabase project URL)
8. Click **Create**
9. Copy:
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxx`

#### B. Configure in Supabase

1. Back in Supabase Dashboard: **Authentication > Providers**
2. Find **Google**, click to expand
3. Toggle **Enable**
4. Paste:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
5. Click **Save**

#### C. Configure Site URL

1. Go to **Authentication > URL Configuration**
2. **Site URL**: `https://your-domain.com` (or Vercel URL for now)
3. **Redirect URLs**: Add:
   ```
   https://your-domain.com
   https://your-domain.vercel.app
   ```
4. Click **Save**

---

## Phase 2: Backend Deployment (Render)

### Step 2.1: Prepare Backend Code

Ensure `server/` has these files:

- `index.js` - Main server
- `package.json` - Dependencies
- `.env.example` - Template (not `.env` itself!)
- `routes/`, `middleware/` - Code

### Step 2.2: Create Render Service

1. Go to https://render.com/dashboard
2. Click **New > Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `semesterflow-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 2.3: Add Environment Variables

In Render dashboard, go to **Environment**:

| Key              | Value                                         |
| ---------------- | --------------------------------------------- |
| `GEMINI_API_KEY` | (from https://aistudio.google.com/app/apikey) |
| `NODE_ENV`       | `production`                                  |
| `PORT`           | `3000`                                        |

Click **Save Changes**

### Step 2.4: Update CORS in Code

Before deploying, update `server/index.js`:

```javascript
// OLD
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

// NEW
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-app.vercel.app',
  'http://localhost:5173', // Keep for local dev
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
```

Commit and push changes to GitHub.

### Step 2.5: Deploy

1. Render will auto-deploy on push
2. Check **Logs** tab for deployment progress
3. Once deployed, note the URL: `https://semesterflow-api.onrender.com`

### Step 2.6: Test Backend

```bash
curl https://semesterflow-api.onrender.com/
# Should return: {"status":"ok","message":"SemesterFlow API is running"}
```

---

## Phase 3: Frontend Deployment (Vercel)

### Step 3.1: Update Frontend Config

Update environment variable references in code to use Vercel's format.

Create `vercel.json` (optional, for custom routing):

```json
{
  "routes": [{ "src": "/[^.]+", "dest": "/", "status": 200 }]
}
```

### Step 3.2: Deploy to Vercel

#### Option A: CLI (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts:

- Link to existing project? **No**
- Project name? `semesterflow`
- Directory? `./` (root)

#### Option B: GitHub Integration

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3.3: Add Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

| Name                     | Value                          |
| ------------------------ | ------------------------------ |
| `VITE_SUPABASE_URL`      | (from Supabase Settings > API) |
| `VITE_SUPABASE_ANON_KEY` | (from Supabase Settings > API) |

Click **Save**

### Step 3.4: Redeploy

```bash
vercel --prod
```

Or in Vercel Dashboard: **Deployments > Redeploy**

### Step 3.5: Update Backend URL in Code

In your code, update API calls:

```typescript
// OLD
const response = await fetch('http://localhost:3000/api/chat', ...);

// NEW
const API_BASE_URL = import.meta.env.PROD
  ? 'https://semesterflow-api.onrender.com'
  : 'http://localhost:3000';

const response = await fetch(`${API_BASE_URL}/api/chat`, ...);
```

Commit, push, and Vercel will auto-deploy.

---

## Phase 4: Google OAuth Finalization

### Step 4.1: Update Authorized Redirect URIs

In Google Cloud Console:

1. Go to your OAuth Client
2. **Authorized redirect URIs**: Add:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
3. **Authorized JavaScript origins**: Add:
   ```
   https://your-domain.com
   https://your-app.vercel.app
   ```
4. Click **Save**

### Step 4.2: Update Supabase Redirect URLs

In Supabase Dashboard:

1. **Authentication > URL Configuration**
2. **Redirect URLs**: Add production URLs
   ```
   https://your-domain.com
   https://your-app.vercel.app
   ```

---

## Phase 5: Custom Domain (Optional)

### Step 5.1: Add Domain in Vercel

1. Vercel Dashboard > Settings > Domains
2. Add your domain: `your-domain.com`
3. Follow DNS instructions from your registrar

### Step 5.2: Configure DNS

Add these records:

| Type  | Name | Value                     |
| ----- | ---- | ------------------------- |
| A     | @    | `76.76.21.21` (Vercel IP) |
| CNAME | www  | `cname.vercel-dns.com`    |

### Step 5.3: Update All URLs

Update in:

- [ ] Supabase Redirect URLs
- [ ] Google OAuth Authorized URIs
- [ ] Render CORS config

---

## Phase 6: Verification & Testing

### Checklist

- [ ] Frontend loads at production URL
- [ ] Google Sign-In works
- [ ] Can create a course
- [ ] Study timer saves sessions
- [ ] AI Chatbot responds
- [ ] AI Planner generates plans
- [ ] Analytics display data
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled (Vercel auto)

### Test User Journey

1. **Visit production URL**
2. **Click "Sign in with Google"**
   - Should redirect to Google
   - Authorize app
   - Redirect back to app
3. **Create a course**
   - Add "Test Course"
   - Verify it appears in Dashboard
4. **Start study timer**
   - Timer should count up
   - Stop and save session
   - Verify session appears in Analytics
5. **Test AI Chat**
   - Open chatbot
   - Ask "What's my progress?"
   - Should see streaming response
6. **Test AI Planner**
   - Go to Planner view
   - Set available hours
   - Generate plan
   - Should see personalized plan

---

## Monitoring & Maintenance

### Set Up Monitoring

#### Vercel Analytics

1. Vercel Dashboard > Analytics (Pro feature, $20/month)
2. Track page views, performance, etc.

#### Render Metrics

1. Render Dashboard > Metrics
2. Monitor CPU, memory, response times

#### Supabase Dashboard

1. Database > Usage
2. Watch for approaching free tier limits:
   - 500 MB database
   - 1 GB storage
   - 2 GB bandwidth/month

### Error Tracking

Add Sentry (optional):

```bash
npm install @sentry/react
```

```typescript
// index.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.PROD ? 'production' : 'development',
});
```

### Backup Strategy

1. **Supabase Auto-Backups**: Enabled by default (free tier: daily)
2. **Manual Backup**:
   ```bash
   # Export database
   curl -X GET 'https://your-project.supabase.co/rest/v1/courses' \
     -H "apikey: YOUR_ANON_KEY" > courses_backup.json
   ```

---

## Scaling Considerations

### When to Upgrade

#### Supabase Free Tier Limits

Upgrade when you hit:

- **Database**: 500 MB (Pro: $25/mo for 8 GB)
- **Storage**: 1 GB (Pro: unlimited)
- **Bandwidth**: 2 GB/month (Pro: 50 GB)

#### Render Free Tier Limits

- Free tier sleeps after 15 min inactivity
- Upgrade to Starter ($7/mo) for 24/7 uptime

#### Vercel Free Tier Limits

- 100 GB bandwidth/month
- Unlimited requests
- Upgrade to Pro ($20/mo) for Analytics

### Performance Optimization

1. **Enable Caching**:
   - Add Redis for AI responses
   - Cache Supabase queries

2. **CDN for Assets**:
   - Vercel automatically provides CDN
   - For files: Use Supabase Storage with CDN

3. **Database Indexing**:
   - Already indexed: `user_id`, `course_id`
   - Add more if queries slow down

---

## Troubleshooting

### Issue: "OAuth redirect mismatch"

**Cause**: Google OAuth redirect URL doesn't match Supabase callback
**Fix**: Verify exact URL in Google Console matches Supabase

### Issue: "CORS error in production"

**Cause**: Frontend URL not in Render backend's CORS allowlist
**Fix**: Update `server/index.js` CORS config, redeploy

### Issue: "Supabase RLS blocking queries"

**Cause**: User not authenticated or wrong user_id
**Fix**: Check auth state, verify RLS policies in Supabase SQL Editor

### Issue: "Render backend sleeping (500 error)"

**Cause**: Free tier sleeps after 15 min
**Fix**: Upgrade to Starter plan, or use a cron job to keep alive:

```bash
# Use cron-job.org to ping https://your-api.onrender.com every 10 min
```

### Issue: "Environment variables not loading"

**Cause**: Vercel needs redeploy after adding env vars
**Fix**: Trigger redeploy in Vercel Dashboard

---

## Rollback Procedure

If deployment fails:

1. **Revert Git Commit**:

   ```bash
   git revert HEAD
   git push
   ```

   Vercel and Render auto-redeploy previous version

2. **Rollback in Vercel**:
   - Dashboard > Deployments
   - Find working deployment
   - Click "Promote to Production"

3. **Rollback Database** (if schema changed):
   - Supabase Dashboard > Backups
   - Restore from before migration

---

## Cost Estimate

### Free Tier (Current)

| Service   | Cost         | Limits               |
| --------- | ------------ | -------------------- |
| Vercel    | $0           | 100 GB bandwidth     |
| Render    | $0           | Sleeps after 15 min  |
| Supabase  | $0           | 500 MB DB, 50k users |
| **Total** | **$0/month** | Good for <1k users   |

### Recommended Upgrade ($32/month)

| Service   | Plan    | Cost          |
| --------- | ------- | ------------- |
| Vercel    | Free    | $0            |
| Render    | Starter | $7            |
| Supabase  | Pro     | $25           |
| **Total** |         | **$32/month** |

Benefits:

- 24/7 uptime (Render)
- 8 GB database (Supabase)
- Auto-backups (Supabase)
- Good for ~10k users

---

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Google OAuth configured
- [ ] Custom domain connected (if applicable)
- [ ] SSL certificate active (auto via Vercel)
- [ ] Database schema applied
- [ ] Test user journey successful
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured
- [ ] Backup strategy documented
- [ ] Team has access to dashboards

---

## Next Steps

1. **Announce Launch**: Share with beta testers
2. **Monitor Metrics**: Watch Vercel/Render/Supabase dashboards
3. **Gather Feedback**: Set up feedback form
4. **Iterate**: Fix bugs, add features from roadmap
5. **Scale**: Upgrade plans as needed

---

**Need Help?**

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs

**Last Updated**: December 1, 2025
**Deployment Guide Version**: 1.0
