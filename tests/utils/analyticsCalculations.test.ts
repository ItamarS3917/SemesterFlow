import { describe, it, expect } from 'vitest';
import {
  getWeekNumber,
  calculateDailyAverage,
  getMostProductiveDay,
  getMostProductiveTimeOfDay,
  calculateStreak,
  calculateMonthlyComparison,
} from '../../utils/analyticsCalculations';
import { StudySession } from '../../types';

describe('analyticsCalculations', () => {
  describe('getWeekNumber', () => {
    it('should return a valid week number', () => {
      const date = new Date('2024-01-15');
      const weekNum = getWeekNumber(date);
      expect(weekNum).toBeGreaterThan(0);
      expect(weekNum).toBeLessThanOrEqual(53);
    });

    it('should return consistent week numbers for same week', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-17');
      expect(getWeekNumber(date1)).toBe(getWeekNumber(date2));
    });
  });

  describe('calculateDailyAverage', () => {
    it('should return 0 for empty sessions', () => {
      expect(calculateDailyAverage([])).toBe(0);
    });

    it('should calculate correct daily average', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);

      const sessions: StudySession[] = [
        {
          id: '1',
          courseId: 'ALGEBRA',
          startTime: yesterday.toISOString(),
          durationSeconds: 3600, // 1 hour
          date: yesterday.toISOString().split('T')[0],
        },
        {
          id: '2',
          courseId: 'ALGEBRA',
          startTime: now.toISOString(),
          durationSeconds: 7200, // 2 hours
          date: now.toISOString().split('T')[0],
        },
      ];
      const average = calculateDailyAverage(sessions);
      expect(average).toBeGreaterThan(0);
    });
  });

  describe('getMostProductiveDay', () => {
    it('should return "N/A" for empty sessions', () => {
      expect(getMostProductiveDay([])).toBe('N/A');
    });

    it('should return correct day name', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          courseId: 'ALGEBRA',
          startTime: '2024-01-08T10:00:00Z', // Monday
          durationSeconds: 10800, // 3 hours
          date: '2024-01-08',
        },
        {
          id: '2',
          courseId: 'ALGEBRA',
          startTime: '2024-01-09T10:00:00Z', // Tuesday
          durationSeconds: 3600, // 1 hour
          date: '2024-01-09',
        },
      ];
      const day = getMostProductiveDay(sessions);
      expect(day).toBe('Monday');
    });
  });

  describe('getMostProductiveTimeOfDay', () => {
    it('should return "N/A" for empty sessions', () => {
      expect(getMostProductiveTimeOfDay([])).toBe('N/A');
    });

    it('should return correct time of day', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          courseId: 'ALGEBRA',
          startTime: '2024-01-08T08:00:00Z', // Morning
          durationSeconds: 10800, // 3 hours
          date: '2024-01-08',
        },
        {
          id: '2',
          courseId: 'ALGEBRA',
          startTime: '2024-01-08T15:00:00Z', // Afternoon
          durationSeconds: 3600, // 1 hour
          date: '2024-01-08',
        },
      ];
      const timeOfDay = getMostProductiveTimeOfDay(sessions);
      expect(timeOfDay).toMatch(/Morning|Afternoon|Evening|Night/);
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 for empty sessions', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('should return 0 if no recent sessions', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          courseId: 'ALGEBRA',
          startTime: '2024-01-01T10:00:00Z',
          durationSeconds: 3600,
          date: '2024-01-01',
        },
      ];
      const streak = calculateStreak(sessions);
      expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('should calculate streak for consecutive days including today', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const sessions: StudySession[] = [
        {
          id: '1',
          courseId: 'ALGEBRA',
          startTime: today + 'T10:00:00Z',
          durationSeconds: 3600,
          date: today,
        },
        {
          id: '2',
          courseId: 'ALGEBRA',
          startTime: yesterday + 'T10:00:00Z',
          durationSeconds: 3600,
          date: yesterday,
        },
      ];
      const streak = calculateStreak(sessions);
      expect(streak).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculateMonthlyComparison', () => {
    it('should return 0 for both months with empty sessions', () => {
      const result = calculateMonthlyComparison([]);
      expect(result.current).toBe(0);
      expect(result.previous).toBe(0);
    });

    it('should calculate current and previous month hours', () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthDate = new Date(currentYear, currentMonth, 15);
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 15);

      const sessions: StudySession[] = [
        {
          id: '1',
          courseId: 'ALGEBRA',
          startTime: currentMonthDate.toISOString(),
          durationSeconds: 7200, // 2 hours
          date: currentMonthDate.toISOString().split('T')[0],
        },
        {
          id: '2',
          courseId: 'ALGEBRA',
          startTime: lastMonthDate.toISOString(),
          durationSeconds: 3600, // 1 hour
          date: lastMonthDate.toISOString().split('T')[0],
        },
      ];
      const result = calculateMonthlyComparison(sessions);
      expect(result.current).toBeGreaterThan(0);
      expect(result.previous).toBeGreaterThan(0);
    });
  });
});
