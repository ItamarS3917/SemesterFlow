import Papa from 'papaparse';
import { Course, Assignment, StudySession } from '../types';

/**
 * Export courses to CSV file
 */
export const exportCoursesToCSV = (courses: Course[]) => {
  const csvData = courses.map((course) => ({
    id: course.id,
    name: course.name,
    color: course.color,
    totalHoursTarget: course.totalHoursTarget,
    hoursCompleted: course.hoursCompleted,
    totalAssignments: course.totalAssignments,
    completedAssignments: course.completedAssignments,
    nextExamDate: course.nextExamDate || '',
    knowledge: course.knowledge || '',
    weakConcepts: course.weakConcepts?.join('; ') || '',
  }));

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'semesterflow-courses.csv');
};

/**
 * Export assignments to CSV file
 */
export const exportAssignmentsToCSV = (assignments: Assignment[]) => {
  const csvData = assignments.map((assignment) => ({
    id: assignment.id,
    courseId: assignment.courseId,
    name: assignment.name,
    dueDate: assignment.dueDate || '',
    estimatedHours: assignment.estimatedHours,
    status: assignment.status,
    notes: assignment.notes || '',
    attachments: assignment.attachments?.map((a) => `${a.name} (${a.url})`).join('; ') || '',
    createdAt: assignment.createdAt,
    startedAt: assignment.startedAt || '',
  }));

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'semesterflow-assignments.csv');
};

/**
 * Export study sessions to CSV file
 */
export const exportSessionsToCSV = (sessions: StudySession[], courses: Course[]) => {
  const csvData = sessions.map((session) => {
    const course = courses.find((c) => c.id === session.courseId);
    return {
      id: session.id,
      courseId: session.courseId,
      courseName: course?.name || 'Unknown',
      date: session.date,
      startTime: session.startTime,
      durationSeconds: session.durationSeconds,
      durationMinutes: Math.round(session.durationSeconds / 60),
      durationHours: (session.durationSeconds / 3600).toFixed(2),
      topic: session.topic || '',
      difficulty: session.difficulty || '',
      notes: session.notes || '',
    };
  });

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'semesterflow-sessions.csv');
};

/**
 * Export all data as a complete backup (JSON format for better structure preservation)
 */
export const exportAllDataAsJSON = (
  courses: Course[],
  assignments: Assignment[],
  sessions: StudySession[]
) => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    courses,
    assignments,
    sessions,
    metadata: {
      totalCourses: courses.length,
      totalAssignments: assignments.length,
      totalSessions: sessions.length,
      totalStudyHours: sessions.reduce((sum, s) => sum + s.durationSeconds / 3600, 0).toFixed(2),
    },
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `semesterflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper function to download CSV data
 */
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
