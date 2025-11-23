import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { StudySession } from '../types';
import { useAuth } from './AuthContext';
import * as FirestoreService from '../services/firestore';
import { CoursesContext } from './CoursesContext';
import { StatsContext } from './StatsContext';

interface SessionsContextType {
    sessions: StudySession[];
    loading: boolean;
    saveSession: (courseId: string, durationSeconds: number, notes: string, addToKnowledge: boolean, topic?: string, difficulty?: number) => Promise<void>;
}

export const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export const SessionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const coursesContext = useContext(CoursesContext);
    const statsContext = useContext(StatsContext);

    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSessions([]);
            setLoading(false);
            return;
        }

        const unsubscribe = FirestoreService.subscribeToSessions(user.uid, (data) => {
            setSessions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const saveSession = async (courseId: string, durationSeconds: number, notes: string, addToKnowledge: boolean, topic: string = 'General', difficulty: number = 3) => {
        if (!user || !coursesContext || !statsContext) return;

        const newSession: StudySession = {
            id: Date.now().toString(), // Will be ignored by addDoc
            courseId,
            startTime: new Date().toISOString(),
            durationSeconds,
            notes,
            date: new Date().toISOString().split('T')[0],
            topic,
            difficulty
        };

        // Calculate updates
        const course = coursesContext.courses.find(c => c.id === courseId);
        if (course) {
            const hoursToAdd = durationSeconds / 3600;
            let updatedKnowledge = course.knowledge || '';
            if (addToKnowledge && notes.trim()) {
                const today = new Date().toLocaleDateString();
                updatedKnowledge += `\n\n[Study Session Log - ${today} - ${topic}]:\n${notes}`;
            }

            const updatedCourse = {
                ...course,
                hoursCompleted: parseFloat((course.hoursCompleted + hoursToAdd).toFixed(1)),
                knowledge: updatedKnowledge
            };

            const updatedStats = {
                ...statsContext.userStats,
                totalSemesterHours: parseFloat((statsContext.userStats.totalSemesterHours + hoursToAdd).toFixed(1))
            };

            // Save all atomically (simulated)
            await FirestoreService.saveSessionTransaction(user.uid, newSession, updatedCourse, updatedStats);
        }
    };

    return (
        <SessionsContext.Provider value={{ sessions, loading, saveSession }}>
            {children}
        </SessionsContext.Provider>
    );
};
