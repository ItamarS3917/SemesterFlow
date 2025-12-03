# Contributing Guide for SemesterFlow

> **For**: LLM Agents, Developers, and Contributors
> **Last Updated**: December 1, 2025

---

## Code Standards & Conventions

### TypeScript Standards

#### 1. **NEVER use `any` type**
```typescript
// ❌ WRONG
const data: any = await fetch();

// ✅ CORRECT
const data: Course[] = await fetch();
```

#### 2. **Always import types from types.ts**
```typescript
// ❌ WRONG
interface Course { id: string; name: string; }

// ✅ CORRECT
import { Course } from '../types';
```

#### 3. **Use TypeScript enums for constants**
```typescript
// ✅ CORRECT
import { AssignmentStatus } from '../types';
const status = AssignmentStatus.IN_PROGRESS;

// ❌ WRONG
const status = "IN_PROGRESS"; // Magic string
```

---

### React Component Standards

#### 1. **Function Components Only**
```typescript
// ✅ CORRECT
export const MyComponent: React.FC<Props> = ({ prop1 }) => {
  return <div>{prop1}</div>;
};

// ❌ WRONG - Don't use class components
export class MyComponent extends React.Component { ... }
```

#### 2. **Use Custom Hooks for Data Access**
```typescript
// ✅ CORRECT
import { useCourses } from '../hooks/useCourses';

const { courses, addCourse } = useCourses();

// ❌ WRONG - Direct Supabase calls
import { supabase } from '../services/supabase';
const { data } = await supabase.from('courses').select();
```

#### 3. **Props Interface Pattern**
```typescript
// ✅ CORRECT
interface MyComponentProps {
  title: string;
  onSave: (data: Course) => void;
  isLoading?: boolean; // Optional props have ?
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onSave,
  isLoading = false // Default value
}) => {
  // Component logic
};
```

#### 4. **Component File Structure**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { useCourses } from '../hooks/useCourses';
import { Icon } from 'lucide-react';

// 2. Interface definitions
interface MyComponentProps {
  // props...
}

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({ ... }) => {
  // 4. Hooks (always at top, same order every render)
  const { courses } = useCourses();
  const [state, setState] = useState('');

  useEffect(() => {
    // effects...
  }, []);

  // 5. Event handlers
  const handleClick = () => {
    // logic...
  };

  // 6. Render helpers (if needed)
  const renderItem = (item: Course) => (
    <div key={item.id}>{item.name}</div>
  );

  // 7. Return JSX
  return (
    <div>{/* JSX */}</div>
  );
};
```

---

### State Management Rules

#### 1. **Use Context for Global State**
```typescript
// ✅ CORRECT - Global data in Context
const { courses } = useCourses();

// ❌ WRONG - Prop drilling for global data
<ComponentA courses={courses}>
  <ComponentB courses={courses}>
    <ComponentC courses={courses} />
  </ComponentB>
</ComponentA>
```

#### 2. **Use useState for Local UI State**
```typescript
// ✅ CORRECT - UI state in component
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('courses');

// ❌ WRONG - Don't put UI state in Context
```

#### 3. **NEVER Mutate State Directly**
```typescript
// ❌ WRONG
course.name = "New Name";

// ✅ CORRECT
const updatedCourse = { ...course, name: "New Name" };
updateCourse(updatedCourse);
```

---

### Database Access Patterns

#### 1. **Always Use Services Layer**
```typescript
// ✅ CORRECT - Use service functions
import { addCourseToDB } from '../services/supabaseDB';

const handleAddCourse = async () => {
  try {
    await addCourseToDB(user.uid, newCourse);
  } catch (error) {
    console.error('Failed:', error);
  }
};

// ❌ WRONG - Direct Supabase in components
const { data } = await supabase.from('courses').insert(newCourse);
```

#### 2. **Always Include Error Handling**
```typescript
// ✅ CORRECT
try {
  await addCourse(course);
  alert('Course added successfully!');
} catch (error) {
  console.error('Failed to add course:', error);
  alert('Failed to add course. Please try again.');
}

// ❌ WRONG - Unhandled promises
addCourse(course); // Silent failures
```

#### 3. **Row Level Security Awareness**
```typescript
// ✅ CORRECT - RLS automatically filters by user_id
const courses = await fetchCourses(user.uid);
// Query: SELECT * FROM courses WHERE user_id = 'xxx'

// ⚠️ NOTE: You don't need manual WHERE clauses for user_id
// RLS handles it automatically!
```

---

### Styling Guidelines

#### 1. **Use Tailwind-Like Custom Classes**
```typescript
// ✅ CORRECT - Use predefined classes
<div className="retro-card p-6">
  <button className="retro-btn bg-indigo-600">Click</button>
</div>

// ❌ WRONG - Inline styles
<div style={{ padding: '1.5rem', border: '2px solid black' }}>
```

#### 2. **Neo-Brutalist Design System**
All components should follow:
- **Bold 2px borders** (border-2)
- **Strong shadows** (shadow-[4px_4px_0px_0px_#000])
- **High contrast** (black borders, white text on dark bg)
- **Monospace fonts** (font-mono)
- **Retro colors** (avoid gradients, use solid colors)

```typescript
// ✅ CORRECT - Neo-brutalist style
<div className="bg-gray-900 border-2 border-black shadow-[4px_4px_0px_0px_#000] p-4">
  <h2 className="font-mono font-black text-white uppercase">Title</h2>
</div>

// ❌ WRONG - Modern/soft design
<div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl shadow-xl">
  <h2 className="font-sans font-light text-gray-700">Title</h2>
</div>
```

#### 3. **Color Classes**
Course colors are predefined in `constants.ts`:
```typescript
// ✅ CORRECT - Use constants
const COURSE_COLORS = {
  color: 'bg-blue-500',
  bg: 'bg-blue-900/20',
  text: 'text-blue-300',
  border: 'border-blue-500'
};

// ❌ WRONG - Hardcoded random colors
<div className="bg-pink-300 text-purple-700">
```

---

### Naming Conventions

#### 1. **Components: PascalCase**
```
StudyTimer.tsx
CoursesView.tsx
ProcrastinationWidget.tsx
```

#### 2. **Functions: camelCase**
```typescript
const handleAddCourse = () => {};
const fetchUserStats = () => {};
const calculateStreak = () => {};
```

#### 3. **Constants: UPPER_SNAKE_CASE**
```typescript
const INITIAL_USER_STATS = { ... };
const MAX_SESSION_DURATION = 14400;
const API_BASE_URL = 'http://localhost:3000';
```

#### 4. **Types/Interfaces: PascalCase**
```typescript
interface Course { ... }
type ViewState = 'DASHBOARD' | 'TIMER';
enum AssignmentStatus { ... }
```

#### 5. **Files: Match exported component**
```
StudyTimer.tsx → exports StudyTimer
useCourses.ts → exports useCourses()
supabaseDB.ts → exports multiple functions
```

---

### Git Commit Messages

Follow conventional commits:

```
feat: Add procrastination detection widget
fix: Resolve timer not saving sessions
docs: Update architecture documentation
style: Apply neo-brutalist design to settings
refactor: Extract analytics calculations to utils
test: Add unit tests for stats calculations
chore: Update dependencies
```

---

### Error Handling Patterns

#### 1. **User-Facing Errors**
```typescript
try {
  await deleteCourse(courseId);
} catch (error) {
  console.error('Delete failed:', error);
  alert('Failed to delete course. Please try again.'); // User feedback
}
```

#### 2. **Silent Failures for Non-Critical**
```typescript
// OK for analytics tracking
try {
  trackEvent('button_clicked');
} catch (error) {
  console.error('Analytics failed:', error);
  // Don't show error to user
}
```

#### 3. **Validation Errors**
```typescript
if (!courseName.trim()) {
  alert('Course name is required');
  return; // Early return
}

if (targetHours < 1 || targetHours > 1000) {
  alert('Target hours must be between 1 and 1000');
  return;
}
```

---

### Performance Best Practices

#### 1. **Memoize Expensive Calculations**
```typescript
// ✅ CORRECT
import { useMemo } from 'react';

const sortedCourses = useMemo(() => {
  return courses.sort((a, b) => a.name.localeCompare(b.name));
}, [courses]);

// ❌ WRONG - Recalculated every render
const sortedCourses = courses.sort((a, b) => a.name.localeCompare(b.name));
```

#### 2. **Avoid Unnecessary Re-renders**
```typescript
// ✅ CORRECT - Specific dependencies
useEffect(() => {
  fetchCourses();
}, [user.uid]); // Only re-run if uid changes

// ❌ WRONG - Runs every render
useEffect(() => {
  fetchCourses();
}); // Missing dependency array
```

#### 3. **Lazy Load Heavy Components** (Future)
```typescript
// ✅ FUTURE - Code splitting
const Analytics = React.lazy(() => import('./Analytics'));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Analytics />
</Suspense>
```

---

### Security Best Practices

#### 1. **NEVER Expose API Keys in Client**
```typescript
// ❌ WRONG
const GEMINI_API_KEY = "AIzaSyC..."; // Exposed to browser

// ✅ CORRECT - API calls through backend
const response = await fetch('/api/chat', { ... });
```

#### 2. **Sanitize User Input**
```typescript
// ✅ CORRECT
const safeName = courseName.trim().slice(0, 100);

// ❌ WRONG - Accepting raw user input
const courseName = userInput; // Could be 1MB of text
```

#### 3. **Trust RLS, Not Client Checks**
```typescript
// ✅ CORRECT - RLS enforces security
const courses = await fetchCourses(user.uid);
// Supabase ensures user can only see their own data

// ⚠️ DON'T rely on client-side filtering for security
const allCourses = await fetchAll();
const myCourses = allCourses.filter(c => c.userId === user.uid); // Bad
```

---

### Testing Guidelines (Future)

#### 1. **Unit Tests**
```typescript
// Test utilities
describe('calculateStreak', () => {
  it('should return 0 for no sessions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should count consecutive days', () => {
    const sessions = [
      { date: '2025-12-01' },
      { date: '2025-12-02' },
      { date: '2025-12-03' }
    ];
    expect(calculateStreak(sessions)).toBe(3);
  });
});
```

#### 2. **Integration Tests**
```typescript
// Test CRUD operations
it('should add course to database', async () => {
  const course = { name: 'Test', ... };
  await addCourseToDB(userId, course);

  const courses = await fetchCourses(userId);
  expect(courses).toContainEqual(expect.objectContaining({ name: 'Test' }));
});
```

---

### Documentation Requirements

#### 1. **Component Documentation**
Add JSDoc comments for complex components:

```typescript
/**
 * ProcrastinationWidget detects assignments that are overdue or at risk.
 *
 * Algorithm:
 * - Calculates delay ratio: (started - created) / (due - created)
 * - Scores 0-10 (higher = more procrastination)
 * - Flags assignments with <5 days left or >60% time elapsed
 *
 * @param onBreakPattern - Callback when user clicks "Break Pattern" button
 */
export const ProcrastinationWidget: React.FC<Props> = ({ onBreakPattern }) => {
  // ...
};
```

#### 2. **Function Documentation**
```typescript
/**
 * Calculates user's study streak (consecutive days with sessions).
 *
 * @param sessions - Array of study sessions
 * @returns Number of consecutive days with at least one session
 */
export const calculateStreak = (sessions: StudySession[]): number => {
  // ...
};
```

#### 3. **Update Documentation When Changing Architecture**
If you add:
- New database table → Update `ARCHITECTURE.md` and `supabase_schema.sql`
- New API endpoint → Update `API_REFERENCE.md`
- New feature → Update `projectroadmap.md`
- Breaking change → Update `DEPLOYMENT.md`

---

### File Organization

#### 1. **One Component Per File**
```
✅ CORRECT
components/StudyTimer.tsx
components/Analytics.tsx

❌ WRONG
components/AllComponents.tsx // Multiple components in one file
```

#### 2. **Group Related Files**
```
contexts/
  CoursesContext.tsx
  AssignmentsContext.tsx
  SessionsContext.tsx

hooks/
  useCourses.ts
  useAssignments.ts
  useSessions.ts
```

#### 3. **Index Files for Barrel Exports** (Future)
```typescript
// contexts/index.ts
export { AuthProvider, useAuth } from './AuthContext';
export { CoursesProvider, useCourses } from './CoursesContext';

// Import from barrel
import { useAuth, useCourses } from '../contexts';
```

---

### Common Mistakes to Avoid

#### 1. **❌ Forgetting to check authentication**
```typescript
// ❌ WRONG
const Component = () => {
  const { courses } = useCourses();
  return <div>{courses.map(...)}</div>;
};

// ✅ CORRECT
const Component = () => {
  const { user } = useAuth();
  const { courses } = useCourses();

  if (!user) return <LoginPage />;
  return <div>{courses.map(...)}</div>;
};
```

#### 2. **❌ Not cleaning up effects**
```typescript
// ❌ WRONG
useEffect(() => {
  const interval = setInterval(() => {...}, 1000);
  // Memory leak - interval never cleared
}, []);

// ✅ CORRECT
useEffect(() => {
  const interval = setInterval(() => {...}, 1000);
  return () => clearInterval(interval); // Cleanup
}, []);
```

#### 3. **❌ Using indexes as keys**
```typescript
// ❌ WRONG
{courses.map((course, index) => (
  <div key={index}>{course.name}</div>
))}

// ✅ CORRECT
{courses.map((course) => (
  <div key={course.id}>{course.name}</div>
))}
```

#### 4. **❌ Mutating props**
```typescript
// ❌ WRONG
const Component = ({ course }) => {
  course.name = "Modified"; // Mutating prop
  return <div>{course.name}</div>;
};

// ✅ CORRECT
const Component = ({ course }) => {
  const [localCourse, setLocalCourse] = useState(course);
  const handleChange = () => {
    setLocalCourse({ ...localCourse, name: "Modified" });
  };
};
```

---

### Code Review Checklist

Before submitting code, verify:

- [ ] All TypeScript types are explicit (no `any`)
- [ ] Components use custom hooks for data access
- [ ] Error handling is present with user feedback
- [ ] Follows neo-brutalist design system
- [ ] No hardcoded API keys or secrets
- [ ] No direct Supabase calls in components
- [ ] Proper cleanup in useEffect hooks
- [ ] Keys are unique IDs (not indexes)
- [ ] Props are not mutated
- [ ] Documentation is updated if architecture changed
- [ ] Commit message follows conventional commits
- [ ] Code is formatted consistently

---

### For LLM Agents: Quick Reference

When generating code:

1. **Import types from types.ts** - Never redefine
2. **Use hooks from hooks/** - Never direct Supabase
3. **Follow neo-brutalist design** - Bold borders, shadows, mono fonts
4. **Handle all errors** - Try-catch with user alerts
5. **TypeScript strict mode** - No `any`, all types explicit
6. **Document complex logic** - JSDoc for functions
7. **Test authentication** - Check user before rendering
8. **Clean up effects** - Return cleanup functions
9. **Unique keys** - Use IDs, not indexes
10. **Update docs** - If adding features, update roadmap

---

**Questions?**
- Architecture: `docs/ARCHITECTURE.md`
- API Docs: `docs/API_REFERENCE.md`
- Deployment: `docs/DEPLOYMENT.md`
- Supabase Migration: `docs/SUPABASE_MIGRATION.md`

**Last Updated**: December 1, 2025
