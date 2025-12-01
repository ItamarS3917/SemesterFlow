# SemesterFlow Documentation

> **Comprehensive guides for developers, LLM agents, and contributors**
> **Last Updated**: December 1, 2025

---

## 📚 Quick Navigation

### For LLM Agents Writing Code
Start here to avoid errors and follow project standards:

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, data flow, patterns ⭐ **READ FIRST**
2. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Code standards, conventions, best practices
3. **[API_REFERENCE.md](./API_REFERENCE.md)** - Backend endpoints documentation

### For Deployment
4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Step-by-step production deployment guide
5. **[SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md)** - Firebase → Supabase migration details

### For Project Planning
6. **[masterplan.md](./masterplan.md)** - Project vision, goals, roadmap
7. **[projectroadmap.md](./projectroadmap.md)** - Detailed progress tracker with checkboxes

---

## 📋 Documentation Overview

| Document | Purpose | Audience | Lines |
|----------|---------|----------|-------|
| **ARCHITECTURE.md** | System design, data flow, component structure | Developers, LLM Agents | ~800 |
| **CONTRIBUTING.md** | Code standards, TypeScript rules, patterns | Developers, LLM Agents | ~600 |
| **API_REFERENCE.md** | Backend API docs with examples | Developers, Frontend | ~450 |
| **DEPLOYMENT.md** | Production deployment guide | DevOps, Developers | ~550 |
| **SUPABASE_MIGRATION.md** | Migration from Firebase | Historical Reference | ~250 |
| **masterplan.md** | Project vision and goals | Stakeholders, Team | ~500 |
| **projectroadmap.md** | Detailed progress tracking | Team, Contributors | ~650 |
| **README.md** (this file) | Documentation navigation | Everyone | ~100 |

**Total**: ~3,900 lines of documentation

---

## 🚀 Quick Start Guides

### "I'm an LLM Agent - How do I write code without errors?"

Read in this order:
1. [ARCHITECTURE.md](./ARCHITECTURE.md#for-llm-agents-critical-rules) - Section: "For LLM Agents: Critical Rules"
2. [CONTRIBUTING.md](./CONTRIBUTING.md#for-llm-agents-quick-reference) - Section: "For LLM Agents: Quick Reference"
3. [ARCHITECTURE.md](./ARCHITECTURE.md#common-patterns--best-practices) - Section: "Common Patterns & Best Practices"

**Key Rules**:
- ✅ Always use context hooks (`useCourses`, `useAssignments`)
- ✅ Never use `any` type in TypeScript
- ✅ Import types from `types.ts`
- ✅ Handle all errors with try-catch
- ✅ Follow neo-brutalist design (bold borders, shadows)

### "I'm deploying to production"

Follow [DEPLOYMENT.md](./DEPLOYMENT.md) step-by-step:
1. Set up Supabase database
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Configure Google OAuth
5. Test user journey

**Est. Time**: 30-45 minutes

### "I need to understand the database schema"

See [ARCHITECTURE.md](./ARCHITECTURE.md#database-schema-supabase-postgresql) - Section: "Database Schema"

Quick summary:
- **courses** - Course data with knowledge base
- **assignments** - Assignments with file attachments
- **sessions** - Study session logs
- **user_stats** - User progress tracking
- **course_knowledge** - Vector embeddings for AI (future)

All protected by Row Level Security (RLS).

### "I'm calling the backend API"

See [API_REFERENCE.md](./API_REFERENCE.md) for:
- `POST /api/chat` - AI chatbot
- `POST /api/plan` - Generate study plans
- `POST /api/grade` - (Future) Auto-grading

**Base URL (Dev)**: `http://localhost:3000`

---

## 🎯 Common Tasks

### Task: Add a new component

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md#react-component-standards)
2. Follow component file structure pattern
3. Use custom hooks for data access
4. Apply neo-brutalist styling
5. Update [projectroadmap.md](./projectroadmap.md) if it's a new feature

### Task: Add a database table

1. Update `supabase_schema.sql` with new table
2. Add RLS policies for user data isolation
3. Update [ARCHITECTURE.md](./ARCHITECTURE.md#database-schema-supabase-postgresql)
4. Create TypeScript type in `types.ts`
5. Add CRUD functions in `services/supabaseDB.ts`

### Task: Fix a bug

1. Check [ARCHITECTURE.md](./ARCHITECTURE.md#common-issues--solutions) - Common Issues section
2. Verify error handling exists
3. Test authentication flow
4. Check RLS policies in Supabase
5. Update [projectroadmap.md](./projectroadmap.md) if fixing a known issue

### Task: Deploy a new version

1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md#phase-6-verification--testing)
2. Run verification checklist
3. Test user journey in production
4. Monitor dashboards (Vercel, Render, Supabase)
5. Update version in [projectroadmap.md](./projectroadmap.md)

---

## 🔍 Finding Information

### "Where is X documented?"

| Looking for... | Found in... |
|----------------|-------------|
| Database tables | [ARCHITECTURE.md](./ARCHITECTURE.md#database-schema-supabase-postgresql) |
| API endpoints | [API_REFERENCE.md](./API_REFERENCE.md) |
| Code standards | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Deployment steps | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Supabase setup | [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) |
| Project goals | [masterplan.md](./masterplan.md) |
| Feature progress | [projectroadmap.md](./projectroadmap.md) |
| Component structure | [ARCHITECTURE.md](./ARCHITECTURE.md#directory-structure) |
| TypeScript types | [ARCHITECTURE.md](./ARCHITECTURE.md#typescript-types-reference) |
| Environment variables | [DEPLOYMENT.md](./DEPLOYMENT.md) or [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md#environment-variables) |

### "How do I...?"

| Question | Answer Location |
|----------|-----------------|
| Add a new feature | [projectroadmap.md](./projectroadmap.md) + [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Fix CORS errors | [API_REFERENCE.md](./API_REFERENCE.md#troubleshooting) |
| Set up development | Project root `README.md` |
| Deploy to production | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Understand data flow | [ARCHITECTURE.md](./ARCHITECTURE.md#data-flow-architecture) |
| Write tests | [CONTRIBUTING.md](./CONTRIBUTING.md#testing-guidelines-future) |
| Scale the app | [DEPLOYMENT.md](./DEPLOYMENT.md#scaling-considerations) |
| Migrate from Firebase | [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) |

---

## 🛠️ Technology Stack

See [masterplan.md](./masterplan.md#technology-stack) for full details.

**Frontend**:
- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind-like custom CSS

**Backend**:
- Supabase (PostgreSQL, Auth, Storage)
- Express.js (AI API proxy)
- Gemini API (AI features)
- pgvector (Vector search for RAG)

**Deployment**:
- Vercel (Frontend)
- Render (Backend)
- Supabase Cloud (Database)

---

## 📊 Project Status

**Current Version**: v0.0.0 (Development)
**Phase**: Phase 1 - Core Foundation (85% complete)

See [projectroadmap.md](./projectroadmap.md#quick-status-overview) for detailed progress.

**Recent Updates**:
- ✅ Migrated from Firebase to Supabase
- ✅ Added Row Level Security (RLS)
- ✅ Implemented pgvector for AI
- ✅ Created comprehensive documentation
- ⚪ Production deployment pending

---

## 🤝 Contributing

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards
2. Check [projectroadmap.md](./projectroadmap.md) for open tasks
3. Follow [ARCHITECTURE.md](./ARCHITECTURE.md) patterns
4. Test locally before committing
5. Update documentation if adding features

**Commit Message Format**:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Google OAuth config in Supabase
   - Verify redirect URLs match exactly
   - See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

2. **CORS errors**
   - Update `server/index.js` with frontend URL
   - See [API_REFERENCE.md](./API_REFERENCE.md#cors-configuration)

3. **RLS blocking queries**
   - Ensure user is authenticated
   - Check RLS policies in Supabase SQL Editor
   - See [ARCHITECTURE.md](./ARCHITECTURE.md#row-level-security-rls)

4. **TypeScript errors**
   - Import types from `types.ts`
   - No `any` types allowed
   - See [CONTRIBUTING.md](./CONTRIBUTING.md#typescript-standards)

For more issues, check individual documentation files.

---

## 📞 Support & Resources

### Internal Documentation
- All docs in `/docs` folder
- Project root `README.md` for setup
- `supabase_schema.sql` for database schema

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Getting Help
1. Check documentation first (you're here!)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) and [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Check issue tracker on GitHub
4. Ask in team chat

---

## 📝 Updating Documentation

When making changes:

1. **Code changes**: Update [ARCHITECTURE.md](./ARCHITECTURE.md) if architecture changed
2. **New features**: Update [projectroadmap.md](./projectroadmap.md) to mark complete
3. **API changes**: Update [API_REFERENCE.md](./API_REFERENCE.md)
4. **Deployment changes**: Update [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Standards changes**: Update [CONTRIBUTING.md](./CONTRIBUTING.md)

**Always update "Last Updated" date at top of edited docs.**

---

## 📦 Documentation Maintenance

### Review Schedule
- **Weekly**: Update [projectroadmap.md](./projectroadmap.md) progress
- **Monthly**: Review and update all docs for accuracy
- **Per Release**: Update version numbers and completion status

### Version Control
All documentation is version-controlled in Git alongside code.

**Current Documentation Version**: 1.1 (Supabase migration update)

---

## 🎓 Learning Path

### For New Developers

1. **Day 1**: Read [masterplan.md](./masterplan.md) + [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Day 2**: Read [CONTRIBUTING.md](./CONTRIBUTING.md) + Set up local dev
3. **Day 3**: Read [API_REFERENCE.md](./API_REFERENCE.md) + Test API calls
4. **Day 4**: Start small task from [projectroadmap.md](./projectroadmap.md)
5. **Week 2**: Attempt [DEPLOYMENT.md](./DEPLOYMENT.md) to staging

### For LLM Agents

**Before writing any code**:
1. [ARCHITECTURE.md](./ARCHITECTURE.md#for-llm-agents-critical-rules) (5 min read)
2. [CONTRIBUTING.md](./CONTRIBUTING.md#for-llm-agents-quick-reference) (3 min read)

**Total**: 8 minutes to prevent errors 🎯

---

**Documentation Maintained By**: Development Team
**Last Updated**: December 1, 2025
**Total Documentation**: ~3,900 lines across 8 files
**Status**: ✅ Complete and Ready for Use
