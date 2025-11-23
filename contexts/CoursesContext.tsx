import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../types';
import { useAuth } from './AuthContext';
import * as FirestoreService from '../services/firestore';

interface CoursesContextType {
    courses: Course[];
    loading: boolean;
    addCourse: (course: Course) => Promise<void>;
    updateCourse: (course: Course) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    updateCourseWeakness: (courseId: string, concepts: string[]) => Promise<void>;
}

export const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setCourses([]);
            setLoading(false);
            return;
        }

        const unsubscribe = FirestoreService.subscribeToCourses(user.uid, (data) => {
            setCourses(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addCourse = async (course: Course) => {
        if (user) await FirestoreService.addCourseToDB(user.uid, course);
    };

    const updateCourse = async (course: Course) => {
        if (user) await FirestoreService.updateCourseInDB(user.uid, course);
    };

    const deleteCourse = async (id: string) => {
        if (user) await FirestoreService.deleteCourseFromDB(user.uid, id);
    };

    const updateCourseWeakness = async (courseId: string, concepts: string[]) => {
        if (!user) return;
        const course = courses.find(c => c.id === courseId);
        if (course) {
            await FirestoreService.updateCourseInDB(user.uid, { ...course, weakConcepts: concepts });
        }
    };

    return (
        <CoursesContext.Provider value={{ courses, loading, addCourse, updateCourse, deleteCourse, updateCourseWeakness }}>
            {children}
        </CoursesContext.Provider>
    );
};
