-- ============================================
-- SEMESTERFLOW SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  bg TEXT NOT NULL,
  text TEXT NOT NULL,
  border TEXT NOT NULL,
  total_hours_target INTEGER NOT NULL DEFAULT 100,
  hours_completed NUMERIC DEFAULT 0,
  total_assignments INTEGER DEFAULT 0,
  completed_assignments INTEGER DEFAULT 0,
  next_exam_date TIMESTAMPTZ,
  knowledge TEXT,
  weak_concepts TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ
);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  topic TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_days INTEGER DEFAULT 0,
  total_semester_hours NUMERIC DEFAULT 0,
  weekly_hours NUMERIC DEFAULT 0,
  weekly_target INTEGER DEFAULT 28,
  current_phase INTEGER DEFAULT 1,
  phase_name TEXT DEFAULT 'Getting Started',
  phase_progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- COURSES policies
CREATE POLICY "Users can view their own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

-- ASSIGNMENTS policies
CREATE POLICY "Users can view their own assignments" ON assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments" ON assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments" ON assignments
  FOR DELETE USING (auth.uid() = user_id);

-- SESSIONS policies
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- USER_STATS policies
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR FILE UPLOADS
-- ============================================
-- Run this in Supabase Dashboard > Storage > Create Bucket
-- Name: assignments
-- Public: true (or configure RLS for storage)

-- Storage policies (run in SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true);

-- ============================================
-- VECTOR DB & KNOWLEDGE BASE
-- ============================================

-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store course knowledge chunks and their embeddings
CREATE TABLE IF NOT EXISTS course_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(768), -- Dimension for Gemini text-embedding-004
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on course_knowledge
ALTER TABLE course_knowledge ENABLE ROW LEVEL SECURITY;

-- Create a function to search for knowledge
-- This function allows us to perform similarity search using the vector index
CREATE OR REPLACE FUNCTION match_course_knowledge (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  filter_course_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    course_knowledge.id,
    course_knowledge.content,
    course_knowledge.metadata,
    1 - (course_knowledge.embedding <=> query_embedding) AS similarity
  FROM course_knowledge
  WHERE 1 - (course_knowledge.embedding <=> query_embedding) > match_threshold
  AND course_knowledge.course_id = filter_course_id
  ORDER BY course_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS Policies for course_knowledge
-- We need to join with the courses table to verify ownership since course_knowledge doesn't have a direct user_id
CREATE POLICY "Users can view their own course knowledge" ON course_knowledge
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_knowledge.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own course knowledge" ON course_knowledge
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_knowledge.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own course knowledge" ON course_knowledge
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_knowledge.course_id
      AND courses.user_id = auth.uid()
    )
  );

