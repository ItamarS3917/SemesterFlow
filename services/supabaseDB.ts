import { supabase } from './supabase';
import { Course, Assignment, StudySession, UserStats } from '../types';
import { INITIAL_USER_STATS } from '../constants';

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// ============ COURSES ============

export const fetchCourses = async (uid: string): Promise<Course[]> => {
  const { data, error } = await supabase.from('courses').select('*').eq('user_id', uid);

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    bg: row.bg,
    text: row.text,
    border: row.border,
    totalHoursTarget: row.total_hours_target,
    hoursCompleted: row.hours_completed,
    totalAssignments: row.total_assignments,
    completedAssignments: row.completed_assignments,
    nextExamDate: row.next_exam_date,
    knowledge: row.knowledge,
    weakConcepts: row.weak_concepts,
  }));
};

export const addCourseToDB = async (uid: string, course: Course): Promise<void> => {
  const { id, ...rest } = course;
  const { error } = await supabase.from('courses').insert({
    user_id: uid,
    name: rest.name,
    color: rest.color,
    bg: rest.bg,
    text: rest.text,
    border: rest.border,
    total_hours_target: rest.totalHoursTarget,
    hours_completed: rest.hoursCompleted || 0,
    total_assignments: rest.totalAssignments || 0,
    completed_assignments: rest.completedAssignments || 0,
    next_exam_date: rest.nextExamDate || null,
    knowledge: rest.knowledge || '',
    weak_concepts: rest.weakConcepts || [],
  });

  if (error) {
    console.error('Error adding course:', error);
    throw error;
  }
};

export const updateCourseInDB = async (uid: string, course: Course): Promise<void> => {
  const { error } = await supabase
    .from('courses')
    .update({
      name: course.name,
      color: course.color,
      bg: course.bg,
      text: course.text,
      border: course.border,
      total_hours_target: course.totalHoursTarget,
      hours_completed: course.hoursCompleted,
      total_assignments: course.totalAssignments,
      completed_assignments: course.completedAssignments,
      next_exam_date: course.nextExamDate || null,
      knowledge: course.knowledge || '',
      weak_concepts: course.weakConcepts || [],
    })
    .eq('id', course.id)
    .eq('user_id', uid);

  if (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourseFromDB = async (uid: string, courseId: string): Promise<void> => {
  const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('user_id', uid);

  if (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// ============ ASSIGNMENTS ============

export const fetchAssignments = async (uid: string): Promise<Assignment[]> => {
  const { data, error } = await supabase.from('assignments').select('*').eq('user_id', uid);

  if (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    dueDate: row.due_date,
    estimatedHours: row.estimated_hours,
    status: row.status,
    notes: row.notes,
    attachments: row.attachments || [],
    files: row.files || [],
    createdAt: row.created_at,
    startedAt: row.started_at,
  }));
};

export const addAssignmentToDB = async (uid: string, assignment: Assignment): Promise<string> => {
  const { id, ...rest } = assignment;

  console.log('Adding assignment with data:', {
    user_id: uid,
    course_id: rest.courseId,
    name: rest.name,
  });

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      user_id: uid,
      course_id: rest.courseId,
      name: rest.name,
      due_date: rest.dueDate || null,
      estimated_hours: rest.estimatedHours,
      status: rest.status,
      notes: rest.notes || '',
      attachments: rest.attachments || [],
      files: rest.files || [],
      created_at: rest.createdAt,
      started_at: rest.startedAt || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding assignment:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log('Assignment created with ID:', data.id);
  return data.id;
};

export const updateAssignmentInDB = async (uid: string, assignment: Assignment): Promise<void> => {
  const { error } = await supabase
    .from('assignments')
    .update({
      course_id: assignment.courseId,
      name: assignment.name,
      due_date: assignment.dueDate || null,
      estimated_hours: assignment.estimatedHours,
      status: assignment.status,
      notes: assignment.notes || '',
      attachments: assignment.attachments || [],
      files: assignment.files || [],
      started_at: assignment.startedAt || null,
    })
    .eq('id', assignment.id)
    .eq('user_id', uid);

  if (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

export const deleteAssignmentFromDB = async (uid: string, assignmentId: string): Promise<void> => {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('user_id', uid);

  if (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// ============ SESSIONS ============

export const fetchSessions = async (uid: string): Promise<StudySession[]> => {
  const { data, error } = await supabase.from('sessions').select('*').eq('user_id', uid);

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    startTime: row.start_time,
    durationSeconds: row.duration_seconds,
    notes: row.notes,
    date: row.date,
    topic: row.topic,
    difficulty: row.difficulty,
  }));
};

export const addSessionToDB = async (uid: string, session: StudySession): Promise<void> => {
  const { id, ...rest } = session;
  const { error } = await supabase.from('sessions').insert({
    user_id: uid,
    course_id: rest.courseId,
    start_time: rest.startTime,
    duration_seconds: rest.durationSeconds,
    notes: rest.notes || '',
    date: rest.date,
    topic: rest.topic || '',
    difficulty: rest.difficulty || null,
  });

  if (error) {
    console.error('Error adding session:', error);
    throw error;
  }
};

// ============ USER STATS ============

export const fetchUserStats = async (uid: string): Promise<UserStats> => {
  const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', uid).single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching user stats:', error);
    throw error;
  }

  if (!data) {
    // Create initial stats if they don't exist
    await createUserStats(uid);
    return INITIAL_USER_STATS;
  }

  return {
    streakDays: data.streak_days,
    totalSemesterHours: data.total_semester_hours,
    weeklyHours: data.weekly_hours,
    weeklyTarget: data.weekly_target,
    currentPhase: data.current_phase,
    phaseName: data.phase_name,
    phaseProgress: data.phase_progress,
  };
};

export const createUserStats = async (uid: string): Promise<void> => {
  const { error } = await supabase.from('user_stats').insert({
    user_id: uid,
    streak_days: INITIAL_USER_STATS.streakDays,
    total_semester_hours: INITIAL_USER_STATS.totalSemesterHours,
    weekly_hours: INITIAL_USER_STATS.weeklyHours,
    weekly_target: INITIAL_USER_STATS.weeklyTarget,
    current_phase: INITIAL_USER_STATS.currentPhase,
    phase_name: INITIAL_USER_STATS.phaseName,
    phase_progress: INITIAL_USER_STATS.phaseProgress,
  });

  if (error && error.code !== '23505') {
    // 23505 = unique violation (already exists)
    console.error('Error creating user stats:', error);
    throw error;
  }
};

export const updateUserStatsInDB = async (
  uid: string,
  stats: Partial<UserStats>
): Promise<void> => {
  const updateData: any = {};
  if (stats.streakDays !== undefined) updateData.streak_days = stats.streakDays;
  if (stats.totalSemesterHours !== undefined)
    updateData.total_semester_hours = stats.totalSemesterHours;
  if (stats.weeklyHours !== undefined) updateData.weekly_hours = stats.weeklyHours;
  if (stats.weeklyTarget !== undefined) updateData.weekly_target = stats.weeklyTarget;
  if (stats.currentPhase !== undefined) updateData.current_phase = stats.currentPhase;
  if (stats.phaseName !== undefined) updateData.phase_name = stats.phaseName;
  if (stats.phaseProgress !== undefined) updateData.phase_progress = stats.phaseProgress;

  const { error } = await supabase.from('user_stats').update(updateData).eq('user_id', uid);

  if (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// ============ TRANSACTION HELPER ============

export const saveSessionTransaction = async (
  uid: string,
  session: StudySession,
  course: Course,
  newStats: UserStats
): Promise<void> => {
  await Promise.all([
    addSessionToDB(uid, session),
    updateCourseInDB(uid, course),
    updateUserStatsInDB(uid, newStats),
  ]);
};
