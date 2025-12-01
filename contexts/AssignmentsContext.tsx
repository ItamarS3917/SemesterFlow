import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Assignment, AssignmentStatus } from '../types';
import { useAuth } from './AuthContext';
import * as SupabaseDB from '../services/supabaseDB';
import { CoursesContext } from './CoursesContext';

interface AssignmentsContextType {
    assignments: Assignment[];
    loading: boolean;
    addAssignment: (assignment: Assignment) => Promise<string>;
    updateAssignment: (assignment: Assignment) => Promise<void>;
    deleteAssignment: (id: string) => Promise<void>;
    toggleAssignmentStatus: (id: string) => Promise<void>;
    refreshAssignments: () => Promise<void>;
}

export const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export const AssignmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const coursesContext = useContext(CoursesContext);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshAssignments = async () => {
        if (!user) return;
        try {
            const data = await SupabaseDB.fetchAssignments(user.uid);
            setAssignments(data);
        } catch (error) {
            console.error('Error refreshing assignments:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            setAssignments([]);
            setLoading(false);
            return;
        }

        const loadAssignments = async () => {
            try {
                const data = await SupabaseDB.fetchAssignments(user.uid);
                setAssignments(data);
            } catch (error) {
                console.error('Error loading assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAssignments();
    }, [user]);

    const addAssignment = async (newAssignment: Assignment): Promise<string> => {
        if (!user) throw new Error('Not authenticated');
        
        try {
            const assignmentWithDate = {
                ...newAssignment,
                createdAt: newAssignment.createdAt || new Date().toISOString()
            };
            
            // Add assignment and get the DB-generated ID
            const dbId = await SupabaseDB.addAssignmentToDB(user.uid, assignmentWithDate);
            await refreshAssignments();

            // Update course count
            if (coursesContext) {
                const course = coursesContext.courses.find(c => c.id === newAssignment.courseId);
                if (course) {
                    await SupabaseDB.updateCourseInDB(user.uid, {
                        ...course,
                        totalAssignments: course.totalAssignments + 1
                    });
                    await coursesContext.refreshCourses();
                }
            }
            
            return dbId;
        } catch (error) {
            console.error('Error adding assignment:', error);
            throw error;
        }
    };

    const updateAssignment = async (assignment: Assignment) => {
        if (!user) return;
        await SupabaseDB.updateAssignmentInDB(user.uid, assignment);
        await refreshAssignments();
    };

    const deleteAssignment = async (id: string) => {
        if (!user) return;
        const assignment = assignments.find(a => a.id === id);
        if (assignment) {
            await SupabaseDB.deleteAssignmentFromDB(user.uid, id);
            await refreshAssignments();

            if (coursesContext) {
                const course = coursesContext.courses.find(c => c.id === assignment.courseId);
                if (course) {
                    await SupabaseDB.updateCourseInDB(user.uid, {
                        ...course,
                        totalAssignments: Math.max(0, course.totalAssignments - 1)
                    });
                    await coursesContext.refreshCourses();
                }
            }
        }
    };

    const toggleAssignmentStatus = async (id: string) => {
        if (!user) return;
        const a = assignments.find(item => item.id === id);
        if (a) {
            const newStatus = a.status === AssignmentStatus.COMPLETED
                ? AssignmentStatus.IN_PROGRESS
                : AssignmentStatus.COMPLETED;

            let startedAt = a.startedAt;
            if (newStatus === AssignmentStatus.IN_PROGRESS && !a.startedAt) {
                startedAt = new Date().toISOString();
            }

            await SupabaseDB.updateAssignmentInDB(user.uid, { ...a, status: newStatus, startedAt });
            await refreshAssignments();

            if (coursesContext) {
                const course = coursesContext.courses.find(c => c.id === a.courseId);
                if (course) {
                    const change = newStatus === AssignmentStatus.COMPLETED ? 1 : -1;
                    await SupabaseDB.updateCourseInDB(user.uid, {
                        ...course,
                        completedAssignments: Math.max(0, course.completedAssignments + change)
                    });
                    await coursesContext.refreshCourses();
                }
            }
        }
    };

    return (
        <AssignmentsContext.Provider value={{ assignments, loading, addAssignment, updateAssignment, deleteAssignment, toggleAssignmentStatus, refreshAssignments }}>
            {children}
        </AssignmentsContext.Provider>
    );
};
