import { supabase } from './supabase.js';

export const RESOURCES = {
  COURSES: 'semesterflow://courses',
  ASSIGNMENTS: 'semesterflow://assignments',
  STATS: 'semesterflow://stats',
};

export async function handleListResources() {
  return {
    resources: [
      {
        uri: RESOURCES.COURSES,
        name: 'Courses',
        description: 'List of all active courses and their details',
        mimeType: 'application/json',
      },
      {
        uri: RESOURCES.ASSIGNMENTS,
        name: 'Assignments',
        description: 'List of pending and completed assignments',
        mimeType: 'application/json',
      },
      {
        uri: RESOURCES.STATS,
        name: 'User Stats',
        description: 'Current user statistics (streak, total hours, phase)',
        mimeType: 'application/json',
      },
    ],
  };
}

export async function handleReadResource(uri: string) {
  if (uri === RESOURCES.COURSES) {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
    };
  }

  if (uri === RESOURCES.ASSIGNMENTS) {
    const { data, error } = await supabase.from('assignments').select('*');
    if (error) throw error;
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
    };
  }

  if (uri === RESOURCES.STATS) {
    const { data, error } = await supabase.from('user_stats').select('*').single();
    if (error) throw error;
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
    };
  }

  throw new Error('Resource not found');
}
