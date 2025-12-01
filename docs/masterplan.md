# SemesterFlow - Master Plan

## Project Overview

**SemesterFlow** is an AI-powered study management platform designed to help students track their progress, manage assignments, optimize study sessions, and stay motivated throughout the semester. The app combines gamification, real-time analytics, and AI-powered study assistance to create a comprehensive academic companion.

### Core Philosophy
- **Data-Driven Learning**: Track every study session to identify patterns and optimize learning
- **AI-Powered Guidance**: Personalized study plans and intelligent assistance based on student progress
- **Gamification**: Streaks, progress bars, and visual feedback to maintain motivation
- **Procrastination Combat**: Proactive widgets and micro-sprint sessions to break study paralysis

---

## Current State (v0.0.0)

### Technology Stack

#### Frontend
- **React 19.2.0** - UI framework with latest features
- **TypeScript 5.8.2** - Type safety and developer experience
- **Vite 6.2.0** - Fast build tool and dev server
- **Lucide React 0.554.0** - Icon library for consistent UI
- **Recharts 2.12.7** - Data visualization and analytics charts

#### Backend & Services
- **Supabase 2.47.0** - PostgreSQL database, authentication, and storage
- **Express.js** (server) - REST API for AI features
- **Google Generative AI** - Gemini integration for chatbot and study partner
- **pgvector** - Vector embeddings for AI-powered knowledge search

#### Design System
- **Neo-Brutalism UI** - Bold borders, strong shadows, high contrast
- **Retro-Gaming Aesthetic** - Monospace fonts, pixelated elements, arcade vibes
- **Custom CSS** - Tailwind-inspired utility classes with custom animations

---

### Current Features

#### 1. Authentication & User Management
- **Supabase Authentication** (contexts/AuthContext.tsx, services/supabase.ts)
- Google OAuth Sign-In integration
- Secure session management with JWT tokens
- User profile with metadata support
- Row Level Security (RLS) for data isolation

#### 2. Dashboard (DASHBOARD View)
- **Real-time Stats**:
  - Phase Progress tracking
  - Weekly goal monitoring (hours studied vs target)
  - Lifetime study hours
  - Daily study streak counter
- **Upcoming Deadlines**: Top 3 assignments with due date warnings
- **Procrastination Widget**: Intelligent detection of overdue work with micro-sprint prompts
- **Course Load Summary**: Quick progress bars for all active courses

#### 3. Study Timer (TIMER View)
- **Pomodoro-Style Focus Sessions**
  - Visual timer with retro CRT display effect
  - Course selection with color coding
  - Real-time session recording
- **Session Reports**:
  - Topic tagging
  - Notes and observations
  - Difficulty rating (1-5)
  - Knowledge base sync option
- **Micro-Sprint Mode**: Quick 5-minute sessions triggered from procrastination widget
- Minimum 60-second sessions to prevent data corruption

#### 4. Course Management (COURSES View)
- **Course Tracking**:
  - Total hours target vs completed
  - Assignment completion rates
  - Next exam date countdown
  - Color-coded course cards
  - Weak concepts identification
- **Knowledge Base**: Per-course notes/syllabus storage for AI context

#### 5. Assignment Tracker (ASSIGNMENTS View)
- **Status Management**:
  - NOT_STARTED, IN_PROGRESS, COMPLETED
  - Due date tracking with visual warnings
  - Estimated hours for planning
- **Procrastination Detection**:
  - Tracks assignment creation date vs start date
  - Identifies long-delayed tasks
- **Quick Actions**: Start timer directly from assignment view

#### 6. AI Planner (PLANNER View)
- **Daily Study Plans**:
  - Personalized session recommendations
  - Priority-based task scheduling
  - Duration estimates and reasoning
  - Integration with course knowledge base

#### 7. Study Partner (STUDY_PARTNER View)
- **AI Tutor Modes**:
  - Guided Learning (explanations)
  - Quiz Me (active recall)
- **Personality Selection**:
  - Strict (disciplined coach)
  - Encouraging (supportive mentor)
  - Humorous (fun companion)
  - Socratic (question-based learning)
- Uses course-specific knowledge base for context-aware tutoring

#### 8. ChatBot Assistant
- **Floating AI Assistant**:
  - Context-aware responses based on current data
  - Deadline reminders and progress tracking
  - Technical Q&A using course knowledge bases
  - Stress management suggestions
- **Streaming Responses**: Real-time SSE communication with backend
- **Persistent History**: LocalStorage-based chat memory

#### 9. Analytics (ANALYTICS View)
- **Visual Data Insights**:
  - Study hours by course (bar charts)
  - Weekly progress trends
  - Assignment completion rates
  - Time distribution analysis
- Powered by Recharts for interactive visualizations

#### 10. Settings (SETTINGS View)
- Course CRUD operations
- Weekly target customization
- Profile management
- Firebase data sync controls

---

### Data Architecture

#### Core Types (types.ts)

```typescript
Course {
  id, name, color, bg, text, border
  totalHoursTarget, hoursCompleted
  totalAssignments, completedAssignments
  nextExamDate, knowledge, weakConcepts[]
}

Assignment {
  id, courseId, name, dueDate
  estimatedHours, status, notes
  createdAt, startedAt // Procrastination tracking
}

StudySession {
  id, courseId, startTime, durationSeconds
  notes, date, topic, difficulty
}

UserStats {
  streakDays, totalSemesterHours, weeklyHours
  weeklyTarget, currentPhase, phaseName, phaseProgress
}
```

#### State Management (Context-Based)
- **AuthContext**: User authentication and profile (Supabase Auth)
- **CoursesContext**: Course CRUD and Supabase sync
- **AssignmentsContext**: Assignment management and PostgreSQL storage
- **SessionsContext**: Study session tracking
- **StatsContext**: Calculated analytics and derived metrics
- **AppProvider**: Unified context wrapper

#### Data Persistence
- **Supabase PostgreSQL Tables**:
  - `courses` - Course data with knowledge base text
  - `assignments` - Assignments with file attachments support
  - `sessions` - Study session logs
  - `user_stats` - User statistics and progress tracking
  - `course_knowledge` - Vector embeddings for AI search (schema ready)
- **Row Level Security (RLS)**:
  - All tables protected with user-scoped policies
  - Automatic CASCADE deletes for data integrity
- **LocalStorage**:
  - Chat history (`semesterflow_chat_history`)
  - Temporary UI state

---

### Server Architecture (server/)

#### Endpoints
- **POST /api/chat**: AI chatbot with streaming responses
- **POST /api/plan**: Generate daily study plans
- **POST /api/grade**: (Future) Assignment auto-grading

#### Middleware
- **Rate Limiting**: Prevent API abuse
- **Request Validation**: Input sanitization
- **CORS**: Configured for localhost:5173

#### Security
- `.gitignore` includes `.env` for API key protection
- Server-side Gemini API calls (no client exposure)
- Supabase Row Level Security (RLS) policies enforced
- User data scoped by `user_id` with automatic filtering
- PostgreSQL CASCADE deletes for referential integrity

---

## Goals & Vision

### Short-Term Goals (Next Phase)

#### 1. Enhanced AI Features
- **Smart Reminders**:
  - Push notifications for upcoming deadlines
  - Adaptive study session suggestions
  - Streak-breaking alerts
- **Content Understanding**:
  - PDF/document upload to knowledge base (Supabase Storage)
  - Automatic concept extraction from notes
  - Quiz generation from uploaded materials
- **RAG (Retrieval Augmented Generation)**:
  - Vector search using pgvector for semantic similarity
  - AI-powered knowledge retrieval from course materials
  - Context-aware responses from uploaded documents

#### 2. Gamification Expansion
- **Achievement System**:
  - Badges for milestones (50 hours, 30-day streak, etc.)
  - XP system tied to study hours
  - Leaderboards (optional social features)
- **Visual Progress**:
  - Animated progress bars
  - Confetti effects on completions
  - Retro pixel art rewards

#### 3. Mobile Responsiveness
- **PWA Conversion**:
  - Service workers for offline access
  - App-like experience on mobile
  - Push notification support
- **Touch Optimizations**:
  - Gesture controls for timer
  - Mobile-first navigation improvements

#### 4. Data Export & Insights
- **Report Generation**:
  - Weekly/monthly PDF summaries
  - CSV export of study sessions
  - Semester retrospectives
- **Advanced Analytics**:
  - Heat maps of study patterns
  - Productivity hour identification
  - Correlation analysis (study time vs grades)

---

### Mid-Term Goals (Future Versions)

#### 1. Collaboration Features
- **Study Groups**:
  - Shared courses and deadlines
  - Group study session tracking
  - Collaborative notes
- **Social Learning**:
  - Friend challenges (study hour competitions)
  - Shared knowledge bases
  - Peer tutoring marketplace

#### 2. Integration Ecosystem
- **Calendar Sync**:
  - Google Calendar integration
  - iCal export/import
  - Exam date auto-import from university systems
- **LMS Integration**:
  - Canvas, Blackboard, Moodle connections
  - Auto-import assignments
  - Grade tracking sync
- **Third-Party Apps**:
  - Notion for note-taking
  - Todoist/Things for task management
  - Spotify for study playlists

#### 3. Advanced AI Capabilities
- **Personalized Learning Paths**:
  - ML-based difficulty adjustment
  - Spaced repetition scheduling
  - Weakness-focused study plans
- **Voice Interaction**:
  - Voice commands for timer control
  - Speech-to-text session notes
  - Audio explanations from Study Partner
- **Image Recognition**:
  - Photo-based problem solving
  - Handwritten note digitization
  - Diagram explanations

#### 4. Institutional Version
- **University Dashboard**:
  - Professor analytics (class-wide trends)
  - Early warning system for struggling students
  - Course difficulty insights
- **White-Label Solution**:
  - Branded versions for universities
  - Custom theming and logos
  - Institution-specific integrations

---

### Long-Term Vision (1-2 Years)

#### 1. Holistic Student Wellness
- **Burnout Prevention**:
  - Stress level monitoring via study patterns
  - Mandatory break enforcement
  - Mental health resource integration
- **Sleep & Health Tracking**:
  - Study time vs sleep correlation
  - Optimal study hour recommendations
  - Integration with fitness apps
- **Work-Life Balance**:
  - Social activity suggestions
  - Hobby time tracking
  - Lifestyle coaching

#### 2. Career Readiness
- **Skills Tracking**:
  - Map courses to job skills
  - Portfolio generation from projects
  - LinkedIn skill validation
- **Internship Preparation**:
  - Application deadline tracking
  - Interview prep resources
  - Resume generation from achievements

#### 3. Research Platform
- **Academic Data Insights**:
  - Anonymized data for education research
  - Learning effectiveness studies
  - Open dataset for researchers
- **Crowdsourced Study Methods**:
  - Community-voted best practices
  - Technique sharing (Feynman, Pomodoro, etc.)
  - Success story database

#### 4. Global Expansion
- **Multi-Language Support**:
  - i18n implementation
  - Localized AI models
  - Regional university integrations
- **Accessibility**:
  - Screen reader optimization
  - Dyslexia-friendly modes
  - High-contrast themes
- **Offline-First Architecture**:
  - Full functionality without internet
  - Smart sync when connected
  - Local-first data ownership

---

## MCP Integration Strategy

### Overview
The Model Context Protocol (MCP) will be integrated to transform SemesterFlow into an AI-native application. This strategy has three pillars:

#### 1. SemesterFlow as an MCP Server (External Access)
- **Goal**: Expose Supabase data as "Tools" and "Resources" to external agents (e.g., Claude Desktop).
- **Implementation**: A standalone Node.js server (`mcp-server/`) using the MCP SDK.
- **Capabilities**:
  - **Resources**: Read-only access to `courses`, `assignments`, and `user_stats`.
  - **Tools**: Actions like `add_assignment`, `log_study_session`, `update_task_status`.

#### 2. ChatBot as an MCP Client (Internal Capabilities)
- **Goal**: Empower the internal "Study Partner" to interact with the outside world.
- **Implementation**: Update `server/routes/chat.js` to act as an MCP Client.
- **Capabilities**:
  - **Web Search**: Connect to Brave Search MCP for real-time answers.
  - **Filesystem**: Read local documents without upload.
  - **Calendar**: Sync study plans with Google Calendar.

#### 3. Standardized RAG (Knowledge Base)
- **Goal**: Decouple AI logic from database implementation.
- **Implementation**: Expose the "Knowledge Base" (pgvector) as an MCP Resource.
- **Benefit**: Allows switching vector stores without rewriting AI logic.

---

## Technical Roadmap

### Phase 1: Foundation Completion (Current)
- [x] Core UI/UX with neo-brutalist design
- [x] Supabase authentication (Google OAuth)
- [x] PostgreSQL database with RLS policies
- [x] Study timer with session tracking
- [x] AI chatbot with context awareness
- [x] Basic analytics and visualizations
- [x] Vector search schema (pgvector) - ready for implementation
- [ ] Production deployment (Vercel + Render + Supabase)
- [ ] Environment variable management
- [ ] Error boundary implementation
- [ ] Loading states and skeletons
- [ ] File upload functionality (Supabase Storage)

### Phase 2: Enhancement (Next 3 Months)
- [ ] PWA conversion with service workers
- [ ] Push notification system
- [ ] Advanced analytics (heat maps, trends)
- [ ] PDF/document upload to knowledge base (Supabase Storage)
- [ ] Vector embeddings for uploaded documents (pgvector)
- [ ] RAG-powered AI responses using semantic search
- [ ] Auto-generated quizzes from notes
- [ ] Achievement and badge system
- [ ] Weekly email reports
- [ ] Dark/light theme toggle
- [ ] Real-time collaboration using Supabase Realtime

### Phase 3: Expansion (3-6 Months)
- [ ] Mobile app (React Native)
- [ ] Collaboration features (study groups)
- [ ] Calendar integrations (Google, Outlook)
- [ ] LMS connectors (Canvas, Blackboard)
- [ ] Voice command support
- [ ] Spaced repetition system
- [ ] Premium tier features

### Phase 4: Scale (6-12 Months)
- [ ] Institutional licensing
- [ ] White-label solution
- [ ] API for third-party developers
- [ ] Machine learning for personalization
- [ ] Multi-language support
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Research platform launch

---

## Success Metrics

### User Engagement
- **Daily Active Users (DAU)**: Target 70% of weekly users
- **Study Streak Average**: Target 14+ days
- **Session Completion Rate**: >80% of started timers saved
- **AI Interaction Rate**: >50% of users chat weekly

### Academic Impact
- **Self-Reported Grade Improvement**: Survey-based metric
- **Study Hours Increase**: Track semester-over-semester growth
- **Procrastination Reduction**: Measure assignment start delay decrease
- **Exam Preparedness**: Confidence survey correlation

### Technical Performance
- **Page Load Time**: <2 seconds on 3G
- **Uptime**: 99.9% availability
- **API Response Time**: <500ms for AI queries
- **Crash Rate**: <0.1% sessions

### Business Goals
- **User Retention**: 60% 30-day retention
- **Conversion Rate**: 10% free-to-premium (when launched)
- **NPS Score**: 50+ (strong promoter base)
- **University Partnerships**: 5+ institutions by Year 2

---

## Known Challenges & Mitigation

### Challenge 1: AI Cost Scaling
- **Risk**: Gemini API costs grow with user base
- **Mitigation**:
  - Implement aggressive caching in Supabase
  - Rate limiting per user (tracked in database)
  - Freemium model with AI quotas
  - Explore open-source LLMs for basic features
  - Use vector search to reduce API calls (fetch relevant context only)

### Challenge 2: Data Privacy
- **Risk**: Student academic data is highly sensitive
- **Mitigation**:
  - Supabase Row Level Security (RLS) enforced at database level
  - End-to-end encryption for sensitive notes
  - GDPR/FERPA compliance via Supabase's SOC 2 certification
  - Transparent data policies
  - User data export/deletion tools (Supabase Auth built-in)

### Challenge 3: University Adoption
- **Risk**: Institutions hesitant to endorse third-party tools
- **Mitigation**:
  - Partner with student organizations first
  - Offer institutional dashboards
  - Prove ROI with pilot programs
  - Pursue EdTech accelerators

### Challenge 4: Behavioral Change
- **Risk**: Students may not adopt tracking habits
- **Mitigation**:
  - Onboarding gamification (tutorials as quests)
  - Quick wins (5-minute sessions count)
  - Social proof (testimonials, case studies)
  - Integration with existing workflows

---

## Team & Resources

### Current Status
- **Solo Developer Project**: Full-stack development by single founder
- **Open Source Potential**: Consider community contributions

### Needed Expertise (Future Hiring)
- **Mobile Developer**: React Native for iOS/Android
- **ML Engineer**: Personalization algorithms
- **UI/UX Designer**: Professional design system
- **DevOps Engineer**: Scalable infrastructure
- **Content Creator**: Educational materials and tutorials

### Budget Considerations
- **Current**: Zero-cost (Supabase free tier: 500MB DB + 1GB storage, self-hosted Express server)
- **Near-term**: ~$50/month (Vercel/Render hosting, domain, possible Supabase Pro $25/month)
- **Growth**: $500-1000/month (Gemini API costs, Supabase scaling, infrastructure)
- **Scale**: Revenue-funded through premium tiers

### Supabase Free Tier Limits:
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests
- **Upgrade triggers**: Database > 500MB or bandwidth > 2GB/month

---

## Conclusion

SemesterFlow aims to revolutionize how students manage their academic workload by combining intelligent tracking, AI-powered assistance, and motivational design. The current foundation provides a robust platform for iteration, with a clear roadmap toward becoming an indispensable tool for student success.

**Next Steps**:
1. Deploy production version with Firebase and Render
2. Gather initial user feedback from beta testers
3. Implement top-requested features (notifications, mobile)
4. Launch social media presence and community
5. Pursue university partnerships and funding opportunities

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Status**: Active Development
**License**: TBD (Consider MIT for open-source components)
