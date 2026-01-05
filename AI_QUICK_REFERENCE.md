# AI Instructions - Quick Reference Card

> **1-minute cheat sheet** for using AI with SemesterFlow

---

## 🎯 Your AI Tool → Your File

| AI Tool         | Instruction File                      | Setup                       |
| --------------- | ------------------------------------- | --------------------------- |
| **Claude Code** | `.claude/llm-instructions.md`         | ✅ Auto (done)              |
| **Cursor**      | `.cursorrules`                        | ✅ Auto                     |
| **Copilot**     | `.github/copilot-instructions.md`     | ⚠️ Enable workspace context |
| **Antigravity** | `.antigravity/instructions.md`        | 📋 Ask AI to read it        |
| **Gemini**      | `.gemini/code-assist-instructions.md` | 📋 Copy/paste               |
| **ChatGPT**     | `AI_INSTRUCTIONS.md`                  | 📋 Copy/paste               |

---

## ⚡ Quick Prompts

### Claude Code / Cursor (Automatic)

```
"Create a new component for displaying assignment deadlines"
```

→ **No extra context needed, AI already knows the project**

### Copilot (After setup)

```typescript
// Just start typing:
const MyComponent: React.FC = () => {
  const { courses
```

→ **Autocompletes with proper hooks and patterns**

### Antigravity

```
"Read .antigravity/instructions.md and help me add a study timer feature"
```

→ **AI loads context from file, then implements**

### Gemini

```
"Read .gemini/code-assist-instructions.md. Create a dashboard widget for weekly goals"
```

→ **AI loads context, follows standards**

### ChatGPT

```
[Paste AI_INSTRUCTIONS.md content]

"Help me implement a procrastination detection algorithm"
```

→ **AI has full context for session**

---

## 🚨 7 Critical Rules (AI Will Follow These)

1. ✅ Use `useCourses()`, `useAssignments()`, `useSessions()`, `useStats()`, `useAuth()`
2. ✅ Never call Supabase directly → use `services/supabaseDB.ts`
3. ✅ Import types from `types.ts`
4. ✅ No `any` types
5. ✅ Try-catch + alert() for errors
6. ✅ Neo-brutalist: `border-2 border-black shadow-[4px_4px_0px_0px_#000]`
7. ✅ Check auth: `if (!user) return <LoginPage />;`

---

## 📐 Component Template (AI Uses This)

```typescript
import { Course } from '../types';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../contexts/AuthContext';

export const MyComponent: React.FC<Props> = ({ title }) => {
  const { courses, addCourse } = useCourses();
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  const handleSubmit = async () => {
    try {
      await addCourse(newCourse);
      alert('Success!');
    } catch (error) {
      console.error('Failed:', error);
      alert('Failed to save.');
    }
  };

  return <div className="retro-card p-6">...</div>;
};
```

---

## 🗂️ Key Files (AI Knows These)

- `types.ts` - All interfaces
- `services/supabaseDB.ts` - CRUD operations
- `contexts/*Context.tsx` - Global state
- `hooks/use*.ts` - Data access
- `supabase_schema.sql` - DB schema

---

## 📊 Database (AI Knows This)

**Tables**: `courses`, `assignments`, `sessions`, `user_stats`, `course_knowledge`
**RLS**: Enabled (auto-filters by `user_id`)
**Case**: DB = snake_case, TS = camelCase

---

## ✅ Quick Test

**Ask AI**: "What hooks should I use to access courses?"

**Expected**: "Use `useCourses()` from `hooks/useCourses.ts`"

**If AI doesn't know**: Check setup for your tool above ☝️

---

## 📚 Full Guides

- **How to Use**: `HOW_TO_USE_AI_INSTRUCTIONS.md`
- **Config Details**: `.ai/README.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Standards**: `docs/CONTRIBUTING.md`

---

**Print this card or keep it open while coding!**
