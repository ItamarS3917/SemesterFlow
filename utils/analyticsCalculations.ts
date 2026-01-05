import { StudySession } from '../types';

export const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const calculateWeeklyHours = (sessions: StudySession[], weeksToShow: number = 6) => {
  const weeks: Record<string, number> = {};
  const now = new Date();

  // Initialize last N weeks with 0
  for (let i = weeksToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const weekNum = getWeekNumber(d);
    const key = `Week ${weekNum}`;
    weeks[key] = 0;
  }

  sessions.forEach((session) => {
    const date = new Date(session.startTime);
    const weekNum = getWeekNumber(date);
    const key = `Week ${weekNum}`;

    // Only count if it falls within our initialized range (roughly)
    // A better approach for "Last 6 weeks" is to filter by date first
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= weeksToShow * 7) {
      if (!weeks[key]) weeks[key] = 0;
      weeks[key] += session.durationSeconds / 3600;
    }
  });

  // Convert to array and sort
  // Note: This simple key sort might fail across year boundaries (Week 52 -> Week 1)
  // For production, better to use ISO week dates (YYYY-Www) keys.
  // But for this specific request of "Last 6 weeks", let's refine the logic to be relative to now.

  return getLast6WeeksData(sessions);
};

const getLast6WeeksData = (sessions: StudySession[]) => {
  const data = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7 - now.getDay()); // Start of that week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const hours = sessions.reduce((acc, session) => {
      const sDate = new Date(session.startTime);
      if (sDate >= weekStart && sDate <= weekEnd) {
        return acc + session.durationSeconds / 3600;
      }
      return acc;
    }, 0);

    let name = i === 0 ? 'Current' : `Week -${i}`;
    // Or use actual dates
    // name = `${weekStart.getDate()}/${weekStart.getMonth()+1}`;

    data.push({
      name,
      hours: parseFloat(hours.toFixed(1)),
      target: 21, // Default target, could be dynamic
    });
  }
  return data;
};

export const calculateDailyAverage = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;

  // Find range
  const dates = sessions.map((s) => new Date(s.startTime).getTime());
  const minDate = Math.min(...dates);
  const maxDate = new Date().getTime(); // Up to now

  const daysDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
  const totalHours = sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600;

  return parseFloat((totalHours / daysDiff).toFixed(1));
};

export const getMostProductiveDay = (sessions: StudySession[]): string => {
  if (sessions.length === 0) return 'N/A';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts = new Array(7).fill(0);

  sessions.forEach((s) => {
    const day = new Date(s.startTime).getDay();
    counts[day] += s.durationSeconds;
  });

  const maxIndex = counts.indexOf(Math.max(...counts));
  return days[maxIndex];
};

export const getMostProductiveTimeOfDay = (sessions: StudySession[]): string => {
  if (sessions.length === 0) return 'N/A';

  const periods = {
    'Morning (6-12)': 0,
    'Afternoon (12-18)': 0,
    'Evening (18-24)': 0,
    'Night (0-6)': 0,
  };

  sessions.forEach((s) => {
    const hour = new Date(s.startTime).getHours();
    const duration = s.durationSeconds;

    if (hour >= 6 && hour < 12) periods['Morning (6-12)'] += duration;
    else if (hour >= 12 && hour < 18) periods['Afternoon (12-18)'] += duration;
    else if (hour >= 18 && hour < 24) periods['Evening (18-24)'] += duration;
    else periods['Night (0-6)'] += duration;
  });

  return Object.entries(periods)
    .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    .split(' ')[0];
};

export const calculateStreak = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;

  const sortedDates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let currentCheck =
    sortedDates[0] === today ? today : sortedDates[0] === yesterday ? yesterday : null;

  if (!currentCheck) return 0; // Streak broken or not started recently

  for (const date of sortedDates) {
    if (date === currentCheck) {
      streak++;
      const d = new Date(currentCheck);
      d.setDate(d.getDate() - 1);
      currentCheck = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
};

export const calculateMonthlyComparison = (sessions: StudySession[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonthDate = new Date(now);
  lastMonthDate.setMonth(now.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  let currentHours = 0;
  let lastHours = 0;

  sessions.forEach((s) => {
    const d = new Date(s.startTime);
    const hours = s.durationSeconds / 3600;

    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      currentHours += hours;
    } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
      lastHours += hours;
    }
  });

  return {
    current: parseFloat(currentHours.toFixed(1)),
    previous: parseFloat(lastHours.toFixed(1)),
  };
};
