# SemesterFlow - Architecture Documentation

> **Last Updated**: December 1, 2025
> **For**: LLM Agents and Developers

---

## System Overview

SemesterFlow is a React + TypeScript application with a Supabase PostgreSQL backend and Express.js server for AI features.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Dashboard│  │  Timer   │  │ Analytics│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│         │              │              │                  │
│         └──────────────┴──────────────┘                  │
│                        │                                 │
│              ┌─────────▼─────────┐                      │
│              │   Context API     │                      │
│              │  (State Mgmt)     │                      │
│              └─────────┬─────────┘                      │
└────────────────────────┼──────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌────▼─────┐  ┌──────▼──────┐
│  Supabase      │ │ Express  │  │   Gemini    │
│  PostgreSQL    │ │ Server   │  │   API       │
│  + Auth        │ │ (AI API) │  │ (AI Models) │
└────────────────┘ └──────────┘  └─────────────┘
```

---

## Directory Structure

```
SemesterFlow/
├── docs/                          # Documentation (you are here)
│   ├── ARCHITECTURE.md           # This file
│   ├── masterplan.md             # Project vision & roadmap
│   ├── projectroadmap.md         # Detailed progress tracker
│   ├── SUPABASE_MIGRATION.md     # Migration guide
│   ├── CONTRIBUTING.md           # Code standards
│   ├── API_REFERENCE.md          # Backend API docs
│   └── DEPLOYMENT.md             # Deployment guide
│
├── components/                    # React UI components
│   ├── Dashboard.tsx             # (Inline in App.tsx)
│   ├── StudyTimer.tsx            # Pomodoro timer
│   ├── Analytics.tsx             # Charts and stats
│   ├── ChatBot.tsx               # AI chat interface
│   ├── StudyPartner.tsx          # AI tutor
│   ├── PlannerView.tsx           # AI study planner
│   ├── AssignmentsView.tsx       # Assignment tracker
│   ├── CoursesView.tsx           # Course management
│   ├── SettingsView.tsx          # User settings
│   ├── LoginPage.tsx             # Auth UI
│   ├── ProcrastinationWidget.tsx # Procrastination detection
│   └── CalendarMenu.tsx          # Calendar integration helper
│
├── contexts/                      # React Context providers
│   ├── AppProvider.tsx           # Wrapper for all contexts
│   ├── AuthContext.tsx           # Supabase Auth state
│   ├── CoursesContext.tsx        # Courses CRUD
│   ├── AssignmentsContext.tsx    # Assignments CRUD
│   ├── SessionsContext.tsx       # Study sessions CRUD
│   └── StatsContext.tsx          # Calculated analytics
│
├── hooks/                         # Custom React hooks
│   ├── useCourses.ts             # Access CoursesContext
│   ├── useAssignments.ts         # Access AssignmentsContext
│   ├── useSessions.ts            # Access SessionsContext
│   └── useStats.ts               # Access StatsContext
│
├── services/                      # External service integrations
│   ├── supabase.ts               # Supabase client
│   ├── supabaseDB.ts             # Database CRUD functions
│   ├── firebase.ts               # (DEPRECATED - not used)
│   └── firestore.ts              # (DEPRECATED - not used)
│
├── utils/                         # Utility functions
│   └── analyticsCalculations.ts  # Stats calculations
│
├── server/                        # Express.js backend
│   ├── index.js                  # Server entry point
│   ├── routes/
│   │   ├── chat.js               # POST /api/chat
│   │   ├── plan.js               # POST /api/plan
│   │   └── grade.js              # POST /api/grade
│   └── middleware/
│       ├── rateLimiter.js        # Rate limiting
│       └── validateRequest.js    # Input validation
│
├── App.tsx                        # Main app component
├── index.tsx                      # React entry point
├── types.ts                       # TypeScript type definitions
├── constants.ts                   # App constants
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── .env.example                  # Environment variables template
├── supabase_schema.sql           # Database schema
└── index.html                    # HTML template
```

---

## Data Flow Architecture

### 1. Authentication Flow

```
User clicks "Sign in with Google"
    ↓
LoginPage.tsx → AuthContext.signInWithGoogle()
    ↓
services/supabase.ts → supabase.auth.signInWithOAuth()
    ↓
Supabase redirects to Google OAuth
    ↓
User authorizes → Redirect back to app
    ↓
AuthContext sets user state
    ↓
App.tsx renders AppContent (logged in)
```

### 2. Data CRUD Flow (Example: Adding a Course)

```
User fills form in CoursesView.tsx
    ↓
Calls addCourse() from useCourses() hook
    ↓
CoursesContext.addCourse()
    ↓
services/supabaseDB.addCourseToDB(uid, course)
    ↓
Supabase PostgreSQL INSERT with RLS check
    ↓
Success → Context updates local state
    ↓
All components using useCourses() re-render
```

### 3. AI Chat Flow

```
User types message in ChatBot.tsx
    ↓
POST to http://localhost:3000/api/chat
    ↓
server/routes/chat.js receives request
    ↓
Calls Gemini API with context (courses, assignments, stats)
    ↓
Streams response back to client (SSE)
    ↓
ChatBot.tsx updates messages in real-time
```

---

## Database Schema (Supabase PostgreSQL)

### Tables

#### `courses`

```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES auth.users(id)
name             TEXT
color            TEXT
bg               TEXT
text             TEXT
border           TEXT
total_hours_target    INTEGER
hours_completed       NUMERIC
total_assignments     INTEGER
completed_assignments INTEGER
next_exam_date        TIMESTAMPTZ
knowledge             TEXT
weak_concepts         TEXT[]
created_at            TIMESTAMPTZ
```

#### `assignments`

```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES auth.users(id)
course_id        UUID REFERENCES courses(id) ON DELETE CASCADE
name             TEXT
due_date         TIMESTAMPTZ
estimated_hours  INTEGER
status           TEXT (NOT_STARTED | IN_PROGRESS | COMPLETED)
notes            TEXT
attachments      JSONB (array of attachment objects)
files            JSONB (array of file objects)
created_at       TIMESTAMPTZ
started_at       TIMESTAMPTZ
```

#### `sessions`

```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES auth.users(id)
course_id         UUID REFERENCES courses(id) ON DELETE CASCADE
start_time        TIMESTAMPTZ
duration_seconds  INTEGER
notes             TEXT
date              DATE
topic             TEXT
difficulty        INTEGER (1-5)
created_at        TIMESTAMPTZ
```

#### `user_stats`

```sql
id                     UUID PRIMARY KEY
user_id                UUID UNIQUE REFERENCES auth.users(id)
streak_days            INTEGER
total_semester_hours   NUMERIC
weekly_hours           NUMERIC
weekly_target          INTEGER
current_phase          INTEGER
phase_name             TEXT
phase_progress         INTEGER
updated_at             TIMESTAMPTZ
```

#### `course_knowledge` (For future RAG implementation)

```sql
id           UUID PRIMARY KEY
course_id    UUID REFERENCES courses(id) ON DELETE CASCADE
content      TEXT
embedding    VECTOR(768)  -- pgvector extension
metadata     JSONB
created_at   TIMESTAMPTZ
```

### Row Level Security (RLS) Policies

**All tables have RLS enabled** with policies:

- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

This ensures users can only access their own data.

---

## State Management

### Context Hierarchy

```
<AuthProvider>              ← Supabase Auth state
  <AppProvider>             ← Wraps all data contexts
    <CoursesProvider>       ← Courses state
    <AssignmentsProvider>   ← Assignments state
    <SessionsProvider>      ← Sessions state
    <StatsProvider>         ← Calculated stats
      <App />               ← Main app
    </StatsProvider>
    </SessionsProvider>
    </AssignmentsProvider>
  </CoursesProvider>
  </AppProvider>
</AuthProvider>
```

### Data Fetching Strategy

- **On Mount**: Each context fetches data from Supabase
- **On Update**: Local state updates immediately, then syncs to Supabase
- **Real-time**: NOT currently implemented (polling on mount only)

**Future**: Use Supabase Realtime subscriptions for live updates

---

## Component Architecture

### Smart Components (Have Logic)

- `App.tsx` - Main app, routing, view state
- `StudyTimer.tsx` - Timer logic, session saving
- `ChatBot.tsx` - Chat state, streaming responses
- `StudyPartner.tsx` - AI tutor, concept mapping
- `PlannerView.tsx` - AI plan generation
- `ProcrastinationWidget.tsx` - Procrastination scoring

### Presentational Components (Display Only)

- `Analytics.tsx` - Charts (uses hooks for data)
- `AssignmentsView.tsx` - Assignment list
- `CoursesView.tsx` - Course cards
- `SettingsView.tsx` - Settings form
- `LoginPage.tsx` - Login UI

### Shared UI Patterns

All components use:

- **Neo-brutalist design**: Bold borders, strong shadows
- **Retro styling**: Monospace fonts, CRT effects
- **Tailwind-like classes**: `retro-card`, `retro-btn`, `retro-input`

---

## API Endpoints (Express Server)

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: TBD (deploy to Render/Railway)

### Endpoints

#### `POST /api/chat`

**Purpose**: AI chatbot conversation

**Request**:

```json
{
  "message": "What's my next exam?",
  "history": [
    { "role": "user", "parts": [{ "text": "Previous message" }] },
    { "role": "model", "parts": [{ "text": "Previous response" }] }
  ],
  "systemInstruction": "You are a study assistant..."
}
```

**Response**: Server-Sent Events (SSE) stream

```
data: {"text": "Your"}
data: {"text": " next"}
data: {"text": " exam"}
data: [DONE]
```

#### `POST /api/plan`

**Purpose**: Generate daily study plan

**Request**:

```json
{
  "contextData": {
    "currentDate": "12/1/2025",
    "availableHours": 3,
    "userFocusRequest": "Review Algebra",
    "courses": [...],
    "assignments": [...]
  }
}
```

**Response**:

```json
{
  "date": "12/1/2025",
  "summary": "Focus on Algebra with exam prep",
  "sessions": [
    {
      "id": "1",
      "courseId": "ALGEBRA",
      "activity": "Review Chapter 4",
      "durationMinutes": 60,
      "priority": "HIGH",
      "reasoning": "Exam in 3 days"
    }
  ],
  "totalMinutes": 180
}
```

#### `POST /api/grade`

**Purpose**: (Future) Auto-grade assignments

**Status**: Schema defined, not implemented

---

## TypeScript Types Reference

### Core Types (types.ts)

```typescript
// Course
interface Course {
  id: string;
  name: string;
  color: string; // Tailwind class (bg-blue-500)
  bg: string; // Background class
  text: string; // Text color class
  border: string; // Border class
  totalHoursTarget: number;
  hoursCompleted: number;
  totalAssignments: number;
  completedAssignments: number;
  nextExamDate?: string; // ISO date
  knowledge?: string; // Course notes
  weakConcepts?: string[];
}

// Assignment
interface Assignment {
  id: string;
  courseId: string;
  name: string;
  dueDate: string; // ISO date
  estimatedHours: number;
  status: AssignmentStatus;
  notes?: string;
  createdAt: string; // ISO date
  startedAt?: string; // ISO date
}

enum AssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// Study Session
interface StudySession {
  id: string;
  courseId: string;
  startTime: string; // ISO timestamp
  durationSeconds: number;
  notes?: string;
  date: string; // YYYY-MM-DD
  topic?: string;
  difficulty?: number; // 1-5
}

// User Stats
interface UserStats {
  streakDays: number;
  totalSemesterHours: number;
  weeklyHours: number;
  weeklyTarget: number;
  currentPhase: number;
  phaseName: string;
  phaseProgress: number; // 0-100
}
```

---

## Common Patterns & Best Practices

### 1. Database Operations

```typescript
// ✅ CORRECT: Use context hooks
import { useCourses } from '../hooks/useCourses';

const { courses, addCourse, updateCourse } = useCourses();

// ❌ WRONG: Direct Supabase calls in components
import { supabase } from '../services/supabase';
const { data } = await supabase.from('courses').select();
```

### 2. Authentication Checks

```typescript
// ✅ CORRECT: Use AuthContext
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
if (!user) return <LoginPage />;

// ❌ WRONG: Manual Supabase auth checks
const session = await supabase.auth.getSession();
```

### 3. State Updates

```typescript
// ✅ CORRECT: Update through context
const { updateCourse } = useCourses();
updateCourse({ ...course, hoursCompleted: 10 });

// ❌ WRONG: Direct state mutation
course.hoursCompleted = 10; // This won't trigger re-render
```

### 4. Type Safety

```typescript
// ✅ CORRECT: Use defined types
import { Course, Assignment } from '../types';

const course: Course = { ... };

// ❌ WRONG: Untyped objects
const course: any = { ... };
```

### 5. Error Handling

```typescript
// ✅ CORRECT: Try-catch with user feedback
try {
  await addCourse(newCourse);
} catch (error) {
  console.error('Failed to add course:', error);
  alert('Failed to add course. Please try again.');
}

// ❌ WRONG: Unhandled promises
addCourse(newCourse); // Silent failures
```

---

## Environment Variables

### Required

```bash
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Gemini API (for backend server)
GEMINI_API_KEY=AIza...
```

### Optional

```bash
# Firebase (DEPRECATED - not used)
# VITE_FIREBASE_API_KEY=...
```

---

## Security Considerations

### 1. Row Level Security (RLS)

- All Supabase queries automatically filtered by `user_id`
- Users cannot access other users' data
- Enforced at database level (cannot be bypassed from client)

### 2. API Keys

- Supabase ANON key is safe to expose (RLS protects data)
- Gemini API key stored in backend only (never in client)
- Use environment variables, never hardcode

### 3. Input Validation

- Backend validates all AI requests (rate limiting, size limits)
- Client validates forms before submission
- Sanitize user input before displaying

---

## Performance Optimization

### Current Optimizations

- Component-level code splitting (React.lazy) - NOT YET IMPLEMENTED
- Debounced search inputs - NOT YET IMPLEMENTED
- Memoized calculations in StatsContext

### Future Optimizations (Recommended)

- [ ] Implement React.lazy for code splitting
- [ ] Add Supabase Realtime instead of polling
- [ ] Implement pagination for large datasets
- [ ] Add service worker for offline support (PWA)
- [ ] Use Supabase Storage CDN for files

---

## Testing Strategy (Not Yet Implemented)

### Unit Tests

- Test individual functions in `utils/`
- Test context state updates
- Test type conversions (snake_case ↔ camelCase)

### Integration Tests

- Test authentication flow
- Test CRUD operations with Supabase
- Test AI API endpoints

### E2E Tests

- Test user journeys (login → create course → add session)
- Test timer functionality
- Test chat interactions

---

## Deployment Architecture

```
┌─────────────────┐      ┌──────────────────┐
│   Vercel        │      │  Render/Railway  │
│   (Frontend)    │◄────►│  (Express API)   │
│   React App     │      │  Gemini Proxy    │
└────────┬────────┘      └──────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Supabase      │      │   Google Cloud   │
│   PostgreSQL    │      │   Gemini API     │
│   Auth          │      │                  │
│   Storage       │      │                  │
└─────────────────┘      └──────────────────┘
```

### Deployment Checklist

See `docs/DEPLOYMENT.md` for full guide

---

## Common Issues & Solutions

### Issue: "RLS policy violation"

**Cause**: User not authenticated or accessing wrong user's data
**Solution**: Check `auth.uid()` matches `user_id` in query

### Issue: "CORS error from backend"

**Cause**: Frontend URL not in CORS whitelist
**Solution**: Update `server/index.js` CORS config

### Issue: "Supabase connection failed"

**Cause**: Wrong credentials or network issue
**Solution**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "Type mismatch" errors

**Cause**: Database returns snake_case, app uses camelCase
**Solution**: Use conversion helpers in `supabaseDB.ts`

---

## For LLM Agents: Critical Rules

When writing code for this project:

1. **ALWAYS use context hooks** (`useCourses`, `useAssignments`, etc.)
2. **NEVER directly call Supabase** from components
3. **ALWAYS import types** from `types.ts`
4. **NEVER hardcode API keys** - use environment variables
5. **ALWAYS handle errors** with try-catch and user feedback
6. **FOLLOW the neo-brutalist design** system (bold borders, shadows)
7. **USE TypeScript strictly** - no `any` types
8. **CHECK authentication** before rendering protected content
9. **RESPECT RLS** - all queries auto-filtered by user_id
10. **DOCUMENT new features** in this file and roadmap

---

**Last Updated**: December 1, 2025
**Maintained By**: Development Team
**Questions?**: See other docs in `/docs` folder
