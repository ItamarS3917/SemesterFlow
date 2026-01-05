# SemesterFlow Component Architecture

This document provides an overview of the component structure and relationships within the SemesterFlow application.

## High-Level Overview

SemesterFlow is a React application built with TypeScript and Vite. It uses a **Context-based state management** system to handle global data (Courses, Assignments, Sessions, User Stats) and **Supabase** for backend services (Auth, Database, Storage).

The application is structured around a main `App` component that handles routing (via local state `activeView`) and layout.

## Component Hierarchy

### Root

- **`App.tsx`**: The main entry point.
  - Wraps the app in `AppProvider` (and `AuthProvider`).
  - Handles conditional rendering of views based on `activeView` state.
  - Manages the global layout (Sidebar, Header, Mobile Menu).

### Main Views (Pages)

These components are rendered in the main content area based on the user's navigation.

1.  **`Dashboard`** (Internal to `App.tsx`)
    - **Purpose**: Landing page with high-level stats and quick actions.
    - **Dependencies**: `ProcrastinationWidget`, `StudyTimer` (quick start).
    - **Data**: Uses `useStats`, `useAssignments`, `useCourses`.

2.  **`AssignmentsView.tsx`**
    - **Purpose**: Manage assignments (CRUD), view details, and AI grading.
    - **Dependencies**:
      - `CalendarMenu`: For adding due dates to calendars.
      - `AttachmentLinks`: For managing external links.
      - `FileUpload`: For uploading files to Supabase.
    - **Data**: `useAssignments`, `useCourses`, `useAuth`.

3.  **`CoursesView.tsx`**
    - **Purpose**: Detailed view of courses, progress tracking, and session history.
    - **Dependencies**: None (uses shared UI elements).
    - **Data**: `useCourses`, `useAssignments`, `useSessions`.

4.  **`SettingsView.tsx`**
    - **Purpose**: Application settings, Course management (CRUD), and Knowledge Base uploads.
    - **Dependencies**: None.
    - **Data**: `useCourses` (add/edit/delete courses).

5.  **`PlannerView.tsx`**
    - **Purpose**: AI-powered study schedule generator.
    - **Dependencies**: `CalendarMenu`.
    - **Data**: `useCourses`, `useAssignments`.
    - **External**: Calls local API `/api/plan`.

6.  **`StudyPartner.tsx`**
    - **Purpose**: AI Chatbot for interactive studying and concept mapping.
    - **Dependencies**: `GoogleGenAI` (SDK).
    - **Data**: `useCourses`, `useSessions`.

7.  **`Analytics.tsx`**
    - **Purpose**: Visualizations of study habits and progress.
    - **Dependencies**: `recharts` (Charting library).
    - **Data**: `useCourses`, `useSessions`.
    - **Utils**: `utils/analyticsCalculations`.

8.  **`StudyTimer.tsx`**
    - **Purpose**: Focus timer for tracking study sessions.
    - **Dependencies**: None.
    - **Data**: `useCourses`, `useSessions` (saves sessions).

### Global/Shared Components

- **`ChatBot.tsx`**
  - **Purpose**: Persistent global AI assistant available across the app.
  - **Location**: Rendered in `App.tsx` (floating).
  - **Data**: `useCourses`, `useAssignments`, `useStats`.

- **`ProcrastinationWidget.tsx`**
  - **Purpose**: Detects procrastination patterns and offers AI advice.
  - **Location**: Used in `Dashboard`.
  - **Data**: `useAssignments`.

- **`LoginPage.tsx`**
  - **Purpose**: Authentication screen.
  - **Data**: `useAuth`.

### Utility Components

- **`FileUpload.tsx`**: Handles file selection, validation, and upload to Supabase Storage.
- **`AttachmentLinks.tsx`**: UI for adding/removing external URL links.
- **`CalendarMenu.tsx`**: Dropdown to export events to Google/Outlook/Yahoo/ICS.
- **`DarkModeToggle.tsx`**: Simple toggle for theme preference (persisted in localStorage).

## State Management (Contexts & Hooks)

The application uses a centralized `AppProvider` which composes the following contexts:

1.  **`AuthContext`** (`useAuth`): Handles Supabase authentication (User, Login, Logout).
2.  **`CoursesContext`** (`useCourses`): Manages Course data (CRUD).
3.  **`AssignmentsContext`** (`useAssignments`): Manages Assignment data (CRUD).
4.  **`SessionsContext`** (`useSessions`): Manages Study Session history.
5.  **`StatsContext`** (`useStats`): derived statistics for the user (XP, Streak, etc.).

## External Services

- **Supabase**:
  - **Auth**: User management.
  - **Database**: Stores `courses`, `assignments`, `sessions`, `user_stats`.
  - **Storage**: Stores uploaded files for assignments/knowledge base.
- **Google Gemini AI**:
  - Used in `StudyPartner`, `ProcrastinationWidget`, `ChatBot`, and `PlannerView` (via backend API) for content generation and analysis.

## Directory Structure

```
/
├── components/         # All UI components
├── contexts/           # React Context definitions
├── hooks/              # Custom hooks for accessing contexts
├── services/           # External service integrations (Supabase, Storage)
├── utils/              # Helper functions (Calculations, Validators)
├── App.tsx             # Main application logic
└── types.ts            # TypeScript definitions
```
