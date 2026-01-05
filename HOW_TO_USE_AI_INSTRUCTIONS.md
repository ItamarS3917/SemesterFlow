# How to Use AI Instructions with SemesterFlow

> **Quick Guide**: Get any AI coding assistant to follow your project standards automatically

---

## 🎯 What This Does

This project has pre-configured instruction files for **all major AI coding assistants**. When you use these files, AI tools will:

✅ Use the correct hooks (`useCourses`, `useAssignments`, etc.)
✅ Never call Supabase directly
✅ Import types from `types.ts`
✅ Follow TypeScript strict mode (no `any` types)
✅ Handle errors properly
✅ Use neo-brutalist design patterns
✅ Check authentication before rendering

**Result**: AI writes code that matches your project standards perfectly, every time.

---

## 🚀 Quick Start by Tool

### **Claude Code** (You're using it now!)

**Status**: ✅ Already configured, automatic

**How it works**:

- File `.claude/settings.json` auto-loads `.claude/llm-instructions.md`
- Every conversation automatically has project context
- Zero setup needed

**Test it**:

```bash
# Start a new conversation and ask:
"What hooks should I use to access courses?"

# Expected response: Should mention useCourses() without reading docs
```

---

### **Cursor**

**Status**: ✅ Automatic

**Setup**: None! Cursor automatically reads `.cursorrules`

**How to use**:

1. Open project in Cursor:
   ```bash
   cursor /Users/itamarmacbook/Desktop/SemesterFlow
   ```
2. Start coding - Cursor knows the rules
3. Autocomplete will suggest hooks, correct patterns, neo-brutalist classes

**Test it**:

```typescript
// Start typing:
const { courses

// Cursor should autocomplete:
const { courses, addCourse } = useCourses();
```

---

### **GitHub Copilot**

**Status**: ⚠️ Semi-automatic (requires one-time setup)

**Setup** (one time only):

1. Open VS Code
2. Press `Cmd + ,` (Settings)
3. Search for "copilot"
4. Enable **"Include workspace context"**
5. Restart VS Code

**How it works**:

- Copilot reads `.github/copilot-instructions.md`
- Suggests code following project patterns
- Autocomplete respects your architecture

**Test it**:

```typescript
// Start typing a new component:
export const MyComponent;

// Copilot should suggest the full pattern with hooks and auth check
```

**Docs**: [GitHub Copilot Customization](https://docs.github.com/en/copilot/customizing-copilot)

---

### **Google Antigravity**

**Status**: 📋 Manual reference

**How to use**:

**Option 1 - Reference file**:

```bash
# In Antigravity chat, ask:
"Read .antigravity/instructions.md and help me create a new component
for displaying study analytics"
```

**Option 2 - Direct context**:

1. Open `.antigravity/instructions.md`
2. Copy relevant sections
3. Paste into Antigravity chat
4. Proceed with your request

**Example prompt**:

```
I need to add a feature to track user study streaks.

Context: Read .antigravity/instructions.md for project architecture.

Please create:
1. A new component StudyStreakWidget
2. Use the useSessions() hook to get session data
3. Follow neo-brutalist design (border-2, shadow-[4px_4px_0px_0px_#000])
4. Handle errors with try-catch
```

---

### **Gemini Code Assist**

**Status**: 📋 Manual reference

**How to use**:

**Method 1 - Ask Gemini to read the file**:

```
Read the file .gemini/code-assist-instructions.md in this project.

I need to add a feature that allows users to export their
study analytics to PDF. What's the best approach?
```

**Method 2 - Copy/paste context**:

1. Open `.gemini/code-assist-instructions.md`
2. Copy the entire content
3. Paste into Gemini chat as first message
4. Then ask your coding question

**Example session**:

```
User: [Paste content of .gemini/code-assist-instructions.md]

User: Help me create a new assignment card component that shows:
- Assignment name
- Due date with warning colors
- Progress indicator
- Quick action buttons

Gemini: I'll create this following the SemesterFlow patterns...
[Generates code using useAssignments(), proper types, error handling, etc.]
```

---

### **ChatGPT / Claude (Web)**

**Status**: 📋 Manual reference

**How to use**:

**Best approach**:

1. Open `AI_INSTRUCTIONS.md` (root level)
2. Copy the entire file
3. Paste at start of conversation
4. ChatGPT/Claude will follow these rules for entire session

**Example**:

```
User: [Paste AI_INSTRUCTIONS.md content]

User: I need to implement a feature that lets users set
weekly study goals. Can you help?

ChatGPT: Absolutely! Following the SemesterFlow architecture,
we'll use the useStats() hook and update user_stats table...
```

**Pro tip**: Save this as a "Custom Instructions" preset in ChatGPT settings

---

## 📊 Comparison Table

| Tool            | Setup Time | Auto-Load | Token Savings | Best For            |
| --------------- | ---------- | --------- | ------------- | ------------------- |
| **Claude Code** | 0 min      | ✅ Yes    | ~35K tokens   | Active development  |
| **Cursor**      | 0 min      | ✅ Yes    | Auto          | Autocomplete coding |
| **Copilot**     | 2 min      | ⚠️ Semi   | Auto          | VS Code users       |
| **Antigravity** | 0 min      | ❌ No     | Manual        | Google ecosystem    |
| **Gemini**      | 0 min      | ❌ No     | Manual        | Quick questions     |
| **ChatGPT**     | 0 min      | ❌ No     | Manual        | Planning & design   |

---

## 🎓 What AI Will Know

When using these instructions, AI assistants automatically understand:

### **Critical Rules**

1. ✅ Use `useCourses()`, `useAssignments()`, `useSessions()`, `useStats()`, `useAuth()`
2. ✅ Never call Supabase directly → use `services/supabaseDB.ts`
3. ✅ Import types from `types.ts`
4. ✅ No `any` types allowed
5. ✅ Handle all errors with try-catch + alert()
6. ✅ Neo-brutalist design: `border-2 border-black shadow-[4px_4px_0px_0px_#000]`
7. ✅ Check auth: `if (!user) return <LoginPage />;`

### **Database Architecture**

- Tables: `courses`, `assignments`, `sessions`, `user_stats`, `course_knowledge`
- RLS enabled (Row Level Security)
- snake_case in DB ↔ camelCase in TypeScript
- Conversion helpers in `supabaseDB.ts`

### **Component Pattern**

```typescript
import { Course } from '../types';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../contexts/AuthContext';

export const MyComponent: React.FC<Props> = ({ title }) => {
  const { courses, addCourse } = useCourses();
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return <div className="retro-card p-6">...</div>;
};
```

---

## 🔧 Advanced Usage

### **For Teams**

When onboarding new developers who use different AI tools:

1. **Share this file**: `HOW_TO_USE_AI_INSTRUCTIONS.md`
2. **Point them to their tool's section** above
3. **They're productive immediately** - AI knows the codebase

### **Updating Instructions**

When project architecture changes:

```bash
# 1. Update the universal reference
nano AI_INSTRUCTIONS.md

# 2. Sync to tool-specific files
# Edit: .cursorrules
# Edit: .github/copilot-instructions.md
# Edit: .claude/llm-instructions.md
# Edit: .antigravity/instructions.md
# Edit: .gemini/code-assist-instructions.md

# 3. Commit changes
git add .cursorrules .github/ .claude/ .antigravity/ .gemini/ AI_INSTRUCTIONS.md
git commit -m "docs: Update AI instructions for new DB schema"
git push
```

### **Custom Prompts**

**For complex features**:

```
Read [your-tool-instruction-file] for context.

I need to implement:
- Feature: [Description]
- Requirements: [List]
- Integration: [What it connects to]

Please:
1. Review the existing architecture
2. Suggest the best approach
3. Write the implementation
4. Include error handling
5. Follow neo-brutalist design
```

**For bug fixes**:

```
Following the project standards in [instruction-file]:

Bug: [Description]
Location: [File:line]
Expected: [Behavior]
Actual: [Behavior]

Please diagnose and fix while maintaining:
- Proper error handling
- Type safety
- Existing patterns
```

---

## 📁 File Locations Reference

```
SemesterFlow/
│
├── AI_INSTRUCTIONS.md                    ← Universal reference
│
├── .claude/
│   ├── settings.json                     ← Claude Code config
│   └── llm-instructions.md               ← Claude Code instructions
│
├── .cursorrules                          ← Cursor instructions
│
├── .github/
│   └── copilot-instructions.md           ← GitHub Copilot instructions
│
├── .antigravity/
│   └── instructions.md                   ← Antigravity instructions
│
├── .gemini/
│   └── code-assist-instructions.md       ← Gemini instructions
│
└── .ai/
    ├── README.md                         ← Detailed configuration guide
    └── instructions.md                   ← Backup universal instructions
```

---

## 🐛 Troubleshooting

### **"AI isn't following the patterns"**

**Claude Code / Cursor**:

- Should work automatically
- Try restarting the editor

**Copilot**:

- Check "Include workspace context" is enabled
- Restart VS Code
- Clear Copilot cache: `Cmd+Shift+P` → "Reload Window"

**Gemini / ChatGPT**:

- Make sure you pasted the instructions file at start of conversation
- Re-paste if conversation is long (context may fade)

### **"Instructions file not found"**

```bash
# Verify files exist:
ls -la .claude/ .cursorrules .github/ .antigravity/ .gemini/

# If missing, they're in git:
git checkout .claude/ .cursorrules .github/ .antigravity/ .gemini/
```

### **"AI suggests wrong patterns"**

**Double-check the instruction file is up to date**:

```bash
# View current instructions:
cat .claude/llm-instructions.md

# Should show: useCourses(), useAssignments(), etc.
# If outdated, update from AI_INSTRUCTIONS.md
```

---

## 💡 Pro Tips

### **1. Start Prompts with Context**

```
"Following the SemesterFlow patterns in [instruction-file],
help me add [feature]"
```

### **2. Reference Specific Rules**

```
"As specified in the AI instructions, use useCourses() hook
to fetch course data, not direct Supabase calls"
```

### **3. Ask AI to Self-Review**

```
"Review the code you just wrote and check if it follows
all 7 critical rules from the instructions"
```

### **4. Use for Code Review**

```
"Review this code against the SemesterFlow standards.
Does it follow the component pattern? Are errors handled?"
```

---

## 📚 Additional Resources

- **Full Architecture**: `/docs/ARCHITECTURE.md`
- **Code Standards**: `/docs/CONTRIBUTING.md`
- **API Reference**: `/docs/API_REFERENCE.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **AI Config Guide**: `/.ai/README.md`

---

## ✅ Success Checklist

After using AI instructions, your code should:

- [ ] Use context hooks (no direct Supabase calls)
- [ ] Import types from `types.ts`
- [ ] Have no `any` types
- [ ] Include try-catch error handling
- [ ] Follow neo-brutalist design (`retro-card`, `retro-btn`)
- [ ] Check authentication (`if (!user)`)
- [ ] Use proper TypeScript interfaces
- [ ] Handle loading and error states

**If all checked**: Your AI is following the standards perfectly! ✅

---

## 🎯 Quick Examples

### **Example 1: Creating a New Component**

**Prompt** (any AI tool):

```
Following the instructions in [your-tool-file]:

Create a new component called StudyGoalsWidget that:
1. Displays the user's weekly study goal
2. Shows progress toward that goal
3. Uses the useStats() hook
4. Follows neo-brutalist design
5. Includes error handling
```

**Result**: AI generates code with proper hooks, types, error handling, and design

---

### **Example 2: Adding a Database Feature**

**Prompt**:

```
Using the patterns from [instruction-file]:

I need to add a new feature to track "favorite courses".

Database: Add a favorites array to user_stats table
Frontend: Add star icon to course cards
Logic: Toggle favorite on/off with optimistic updates

Follow all project standards.
```

**Result**: AI provides schema update, service functions, component changes, all following standards

---

### **Example 3: Debugging**

**Prompt**:

```
Following project standards from [instruction-file]:

This code is throwing an error:
[paste code]

Error: [paste error]

Please:
1. Identify the issue
2. Fix it following project patterns
3. Ensure proper error handling
4. Maintain type safety
```

**Result**: AI fixes the bug while maintaining project architecture

---

**Last Updated**: December 1, 2025
**Maintained By**: Development Team
**Questions?**: Check `.ai/README.md` for detailed configuration guide
