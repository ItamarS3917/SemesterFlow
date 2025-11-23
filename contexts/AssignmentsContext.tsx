import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Assignment, AssignmentStatus } from '../types';
import { useAuth } from './AuthContext';
import * as FirestoreService from '../services/firestore';
import { CoursesContext } from './CoursesContext';

interface AssignmentsContextType {
    assignments: Assignment[];
    loading: boolean;
    addAssignment: (assignment: Assignment) => Promise<void>;
    updateAssignment: (assignment: Assignment) => Promise<void>;
    deleteAssignment: (id: string) => Promise<void>;
    toggleAssignmentStatus: (id: string) => Promise<void>;
}

export const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export const AssignmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const coursesContext = useContext(CoursesContext);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setAssignments([]);
            setLoading(false);
            return;
        }

        const unsubscribe = FirestoreService.subscribeToAssignments(user.uid, (data) => {
            setAssignments(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addAssignment = async (newAssignment: Assignment) => {
        if (!user) return;
        const assignmentWithDate = {
            ...newAssignment,
            createdAt: newAssignment.createdAt || new Date().toISOString()
        };
        await FirestoreService.addAssignmentToDB(user.uid, assignmentWithDate);

        // Update course count
        if (coursesContext) {
            const course = coursesContext.courses.find(c => c.id === newAssignment.courseId);
            if (course) {
                await FirestoreService.updateCourseInDB(user.uid, {
                    ...course,
                    totalAssignments: course.totalAssignments + 1
                });
            }
        }
    };

    const updateAssignment = async (assignment: Assignment) => {
        if (user) await FirestoreService.updateAssignmentInDB(user.uid, assignment);
    };

    const deleteAssignment = async (id: string) => {
        if (!user) return;
        const assignment = assignments.find(a => a.id === id);
        if (assignment) {
            await FirestoreService.deleteAssignmentFromDB(user.uid, id);

            if (coursesContext) {
                const course = coursesContext.courses.find(c => c.id === assignment.courseId);
                if (course) {
                    await FirestoreService.updateCourseInDB(user.uid, {
                        ...course,
                        totalAssignments: Math.max(0, course.totalAssignments - 1)
                    });
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

            await FirestoreService.updateAssignmentInDB(user.uid, { ...a, status: newStatus, startedAt });

            if (coursesContext) {
                const course = coursesContext.courses.find(c => c.id === a.courseId);
                if (course) {
                    const change = newStatus === AssignmentStatus.COMPLETED ? 1 : -1;
                    await FirestoreService.updateCourseInDB(user.uid, {
                        ...course,
                        completedAssignments: Math.max(0, course.completedAssignments + change)
                    });
                }
            }
        }
    };

    return (
        <AssignmentsContext.Provider value={{ assignments, loading, addAssignment, updateAssignment, deleteAssignment, toggleAssignmentStatus }}>
            {children}
        </AssignmentsContext.Provider>
    );
};
