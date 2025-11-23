import { useContext } from 'react';
import { AssignmentsContext } from '../contexts/AssignmentsContext';

export const useAssignments = () => {
    const context = useContext(AssignmentsContext);
    if (context === undefined) {
        throw new Error('useAssignments must be used within a AssignmentsProvider');
    }
    return context;
};
