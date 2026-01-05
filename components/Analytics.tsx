import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from 'recharts';
import { Course, StudySession } from '../types';
import { useCourses } from '../hooks/useCourses';
import { useSessions } from '../hooks/useSessions';
import {
  calculateWeeklyHours,
  calculateDailyAverage,
  getMostProductiveDay,
  getMostProductiveTimeOfDay,
  calculateStreak,
  calculateMonthlyComparison,
} from '../utils/analyticsCalculations';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Zap,
  Clock,
  Trophy,
  Flame,
  Download,
} from 'lucide-react';
import { exportSessionsToCSV } from '../utils/exportData';
import { useToast } from '../contexts/ToastContext';

// Hex mapping for Tailwind colors used in constants.ts
const COLORS: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-orange-500': '#f97316',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-red-500': '#ef4444',
  'bg-yellow-400': '#facc15',
  'bg-gray-600': '#4b5563',
  'bg-indigo-500': '#6366f1',
  'bg-pink-500': '#ec4899',
  'bg-teal-500': '#14b8a6',
  'bg-green-900': '#14532d',
};

export const Analytics: React.FC = () => {
  const { courses } = useCourses();
  const { sessions } = useSessions();
  const { addToast } = useToast();
  const [dateRange, setDateRange] = useState<'WEEK' | 'MONTH' | 'SEMESTER'>('MONTH');

  // --- Metrics Calculations ---
  const weeklyData = useMemo(
    () => calculateWeeklyHours(sessions, dateRange === 'SEMESTER' ? 12 : 6),
    [sessions, dateRange]
  );
  const dailyAverage = useMemo(() => calculateDailyAverage(sessions), [sessions]);
  const productiveDay = useMemo(() => getMostProductiveDay(sessions), [sessions]);
  const productiveTime = useMemo(() => getMostProductiveTimeOfDay(sessions), [sessions]);
  const streak = useMemo(() => calculateStreak(sessions), [sessions]);
  const monthlyComp = useMemo(() => calculateMonthlyComparison(sessions), [sessions]);

  // Prepare data for Course Distribution Pie Chart
  const pieData = useMemo(
    () =>
      courses
        .map((c) => ({
          name: c.name,
          value: c.hoursCompleted,
          color: COLORS[c.color] || '#6b7280',
        }))
        .filter((d) => d.value > 0),
    [courses]
  );

  // Trend Calculation (Simple comparison of last two weeks)
  const currentWeekHours = weeklyData[weeklyData.length - 1]?.hours || 0;
  const lastWeekHours = weeklyData[weeklyData.length - 2]?.hours || 0;
  const trend =
    currentWeekHours > lastWeekHours ? 'UP' : currentWeekHours < lastWeekHours ? 'DOWN' : 'FLAT';

  const handleExportSessions = () => {
    try {
      exportSessionsToCSV(sessions, courses);
      addToast({ type: 'success', message: 'Study sessions exported successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      addToast({ type: 'error', message: 'Failed to export sessions.' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-white font-mono uppercase tracking-tight">
          Progress & Analytics
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Button */}
          <button
            onClick={handleExportSessions}
            disabled={sessions.length === 0}
            className="retro-btn bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold font-mono uppercase flex items-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          {/* Date Range Selector */}
          <div className="flex bg-gray-800 p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {(['WEEK', 'MONTH', 'SEMESTER'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1 text-xs font-bold font-mono uppercase transition-all ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white border border-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="retro-card p-4 bg-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-mono uppercase font-bold">
            <Clock className="w-4 h-4 text-indigo-400" />
            Daily Avg
          </div>
          <div className="text-2xl font-black text-white font-mono">{dailyAverage}h</div>
        </div>
        <div className="retro-card p-4 bg-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-mono uppercase font-bold">
            <Zap className="w-4 h-4 text-yellow-400" />
            Best Time
          </div>
          <div className="text-xl font-black text-white font-mono">{productiveTime}</div>
        </div>
        <div className="retro-card p-4 bg-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-mono uppercase font-bold">
            <Trophy className="w-4 h-4 text-emerald-400" />
            Best Day
          </div>
          <div className="text-xl font-black text-white font-mono">{productiveDay}</div>
        </div>
        <div className="retro-card p-4 bg-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-mono uppercase font-bold">
            <Flame className="w-4 h-4 text-orange-500" />
            Streak
          </div>
          <div className="text-2xl font-black text-white font-mono">{streak} Days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Performance */}
        <div className="retro-card p-6">
          <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
            <h3 className="text-lg font-bold text-white font-mono uppercase">Study Trend</h3>
            <div
              className={`flex items-center gap-1 text-xs font-bold font-mono px-2 py-1 border border-black ${
                trend === 'UP'
                  ? 'bg-green-500/20 text-green-400'
                  : trend === 'DOWN'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-700 text-gray-400'
              }`}
            >
              {trend === 'UP' && <ArrowUp className="w-3 h-3" />}
              {trend === 'DOWN' && <ArrowDown className="w-3 h-3" />}
              {trend === 'FLAT' && <Minus className="w-3 h-3" />}
              {trend === 'UP' ? 'IMPROVING' : trend === 'DOWN' ? 'DECLINING' : 'STEADY'}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Space Mono' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Space Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '2px solid #000',
                    color: '#fff',
                    borderRadius: '0px',
                    boxShadow: '4px 4px 0px 0px #000',
                  }}
                  itemStyle={{ color: '#fff', fontFamily: 'Space Mono' }}
                  cursor={{ fill: '#374151' }}
                />
                <Bar dataKey="hours" radius={[0, 0, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.hours >= entry.target
                          ? '#10b981'
                          : entry.hours >= entry.target * 0.8
                            ? '#f59e0b'
                            : '#ef4444'
                      }
                      stroke="#000"
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex justify-between items-center text-xs font-mono text-gray-500">
            <div>
              <span className="text-white font-bold">This Month:</span> {monthlyComp.current}h
            </div>
            <div>
              <span className="text-gray-400">Last Month:</span> {monthlyComp.previous}h
            </div>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="retro-card p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase border-b-2 border-black pb-2">
            Subject Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '2px solid #000',
                      color: '#fff',
                      borderRadius: '0px',
                      boxShadow: '4px 4px 0px 0px #000',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 font-mono text-sm text-center">
                No study data available yet.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {courses.map((c, i) => {
              const hasData = pieData.find((p) => p.name === c.name);
              if (!hasData) return null;
              return (
                <div
                  key={c.id}
                  className="flex items-center text-xs text-gray-300 font-bold font-mono bg-gray-800 px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000]"
                >
                  <div
                    className="w-3 h-3 mr-2 border border-black"
                    style={{ backgroundColor: COLORS[c.color] || '#6b7280' }}
                  ></div>
                  {c.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Course Stats */}
      <div className="retro-card p-6">
        <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase border-b-2 border-black pb-2">
          Course Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course, idx) => {
            const percentage = Math.min(
              100,
              Math.round((course.hoursCompleted / course.totalHoursTarget) * 100)
            );
            const barColor = COLORS[course.color] || '#6b7280';

            return (
              <div
                key={course.id}
                className="bg-gray-800 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border border-black"
                      style={{ backgroundColor: barColor }}
                    ></span>
                    <span className="font-bold text-white font-mono">{course.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-gray-400">
                    {course.hoursCompleted}/{course.totalHoursTarget} HRS
                  </span>
                </div>

                <div className="w-full bg-gray-700 h-4 border-2 border-black mb-3">
                  <div
                    className="h-full border-r-2 border-black transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: barColor }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs font-mono font-bold text-gray-500 uppercase">
                  <span>
                    Assignments: {course.completedAssignments}/{course.totalAssignments}
                  </span>
                  <span>{percentage}% Done</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
