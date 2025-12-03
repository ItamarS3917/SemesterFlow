# AI Instructions for SemesterFlow

> **For**: All AI coding assistants (Claude, Cursor, Copilot, Gemini, etc.)

---

## 🚨 Critical Rules (NEVER BREAK)

1. **Use context hooks** - `useCourses()`, `useAssignments()`, `useSessions()`, `useStats()`, `useAuth()`
2. **Never call Supabase directly** - Use `services/supabaseDB.ts` functions only
3. **Import types from `types.ts`** - Never redefine Course, Assignment, etc.
4. **No `any` type** - TypeScript strict mode enforced
5. **Handle all errors** - Try-catch with user feedback (`alert()` for critical errors)
6. **Neo-brutalist design** - `border-2 border-black shadow-[4px_4px_0px_0px_#000]`
7. **Check auth** - `const { user } = useAuth(); if (!user) return <LoginPage />;`

---

## 📊 Database Architecture

**Supabase PostgreSQL with Row Level Security (RLS)**

- Tables: `courses`, `assignments`, `sessions`, `user_stats`, `course_knowledge`
- RLS: All queries auto-filtered by `user_id` (security at DB level)
- Naming: Database uses `snake_case`, TypeScript uses `camelCase`
- Conversion: Handled by helpers in `services/supabaseDB.ts`

---

## 🎨 Component Pattern (Copy This)

```typescript
import { Course } from '../types';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../contexts/AuthContext';

interface MyComponentProps {
  title: string;
  onSave: (data: Course) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  const { courses, addCourse } = useCourses();
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  const handleSubmit = async () => {
    try {
      await addCourse(newCourse);
      alert('Success!');
    } catch (error) {
      console.error('Failed:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <div className="retro-card p-6">
      <button className="retro-btn bg-indigo-600" onClick={handleSubmit}>
        Save
      </button>
    </div>
  );
};
```

---

## 🔧 Key Files Reference

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces (Course, Assignment, etc.) |
| `services/supabaseDB.ts` | CRUD operations for database |
| `contexts/*Context.tsx` | Global state management (Auth, Courses, etc.) |
| `hooks/use*.ts` | Data access hooks |
| `supabase_schema.sql` | Database schema with RLS policies |

---

## ❌ Common Mistakes to Avoid

```typescript
// ❌ WRONG - Direct Supabase call
import { supabase } from '../services/supabase';
const { data } = await supabase.from('courses').select();

// ✅ CORRECT - Use hook
import { useCourses } from '../hooks/useCourses';
const { courses } = useCourses();
```

```typescript
// ❌ WRONG - Using any type
const data: any = await fetch();

// ✅ CORRECT - Explicit type
const data: Course[] = await fetch();
```

```typescript
// ❌ WRONG - No error handling
await addCourse(newCourse);

// ✅ CORRECT - Try-catch
try {
  await addCourse(newCourse);
  alert('Success!');
} catch (error) {
  console.error('Failed:', error);
  alert('Failed to save.');
}
```

---

## 🎯 Common Tasks

| Task | Action |
|------|--------|
| Add feature | Read `docs/CONTRIBUTING.md` component standards |
| Database query | Use `supabaseDB.ts` functions, never raw Supabase |
| Styling | Use classes: `retro-card`, `retro-btn`, `neo-border` |
| Fix error | Check `docs/ARCHITECTURE.md` Common Issues section |

---

## 📚 Full Documentation

**Location**: `/docs/README.md` (3,900 lines across 8 files)

- **ARCHITECTURE.md** - System design, data flow, component structure
- **CONTRIBUTING.md** - Code standards, TypeScript rules, patterns
- **API_REFERENCE.md** - Backend API endpoints with examples
- **DEPLOYMENT.md** - Production deployment guide

**When to read full docs**:
- Implementing new architecture
- Adding database tables
- Deploying to production
- Fixing complex issues

---

## 🚀 Tech Stack

- **Frontend**: React 19.2.0, TypeScript 5.8.2, Vite 6.2.0
- **Backend**: Supabase (PostgreSQL, Auth, Storage), Express.js
- **AI**: Google Gemini API (chat, planning, future features)
- **Styling**: Custom CSS (neo-brutalist design system)
- **Charts**: Recharts for analytics visualizations

---

**Last Updated**: December 1, 2025
**Project Phase**: Phase 1 - Core Foundation (85% complete)
