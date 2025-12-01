# SemesterFlow - GitHub Copilot Instructions

## Project Context
Study tracker app with AI features | React 19 + TypeScript 5.8 + Supabase + Gemini AI

## Critical Rules
1. **Use hooks**: useCourses(), useAssignments(), useSessions(), useStats(), useAuth()
2. **No direct Supabase** - use services/supabaseDB.ts functions
3. **Import types from types.ts** - never redefine
4. **No `any` type** - strict TypeScript
5. **Error handling** - try-catch with alert() for user feedback
6. **Neo-brutalist design** - border-2 border-black shadow-[4px_4px_0px_0px_#000]
7. **Auth check** - const { user } = useAuth(); if (!user) return <LoginPage />;

## Database
Supabase PostgreSQL with RLS | snake_case → camelCase conversion in supabaseDB.ts

## Component Template
```typescript
import { Course } from '../types';
import { useCourses } from '../hooks/useCourses';

export const MyComponent: React.FC<Props> = ({ title }) => {
  const { courses, addCourse } = useCourses();
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return <div className="retro-card p-6">...</div>;
};
```

## Key Files
types.ts | services/supabaseDB.ts | contexts/*Context.tsx | hooks/use*.ts

## Documentation
/docs/README.md for architecture, standards, API reference
