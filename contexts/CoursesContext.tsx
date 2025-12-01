import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../types';
import { useAuth } from './AuthContext';
import * as SupabaseDB from '../services/supabaseDB';

interface CoursesContextType {
    courses: Course[];
    loading: boolean;
    addCourse: (course: Course) => Promise<void>;
    updateCourse: (course: Course) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    updateCourseWeakness: (courseId: string, concepts: string[]) => Promise<void>;
    refreshCourses: () => Promise<void>;
}

export const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshCourses = async () => {
        if (!user) return;
        try {
            const data = await SupabaseDB.fetchCourses(user.uid);
            setCourses(data);
        } catch (error) {
            console.error('Error refreshing courses:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            setCourses([]);
            setLoading(false);
            return;
        }

        const loadCourses = async () => {
            try {
                const data = await SupabaseDB.fetchCourses(user.uid);
                setCourses(data);
            } catch (error) {
                console.error('Error loading courses:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [user]);

    const addCourse = async (course: Course) => {
        if (!user) throw new Error('Not logged in');
        try {
            await SupabaseDB.addCourseToDB(user.uid, course);
            await refreshCourses();
        } catch (error) {
            console.error('Supabase addCourse error:', error);
            throw error;
        }
    };

    const updateCourse = async (course: Course) => {
        if (!user) throw new Error('Not logged in');
        try {
            await SupabaseDB.updateCourseInDB(user.uid, course);
            await refreshCourses();
        } catch (error) {
            console.error('Supabase updateCourse error:', error);
            throw error;
        }
    };

    const deleteCourse = async (id: string) => {
        if (!user) throw new Error('Not logged in');
        try {
            await SupabaseDB.deleteCourseFromDB(user.uid, id);
            await refreshCourses();
        } catch (error) {
            console.error('Supabase deleteCourse error:', error);
            throw error;
        }
    };

    const updateCourseWeakness = async (courseId: string, concepts: string[]) => {
        if (!user) return;
        const course = courses.find(c => c.id === courseId);
        if (course) {
            await updateCourse({ ...course, weakConcepts: concepts });
        }
    };

    return (
        <CoursesContext.Provider value={{ courses, loading, addCourse, updateCourse, deleteCourse, updateCourseWeakness, refreshCourses }}>
            {children}
        </CoursesContext.Provider>
    );
};
