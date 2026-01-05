import React, { ReactNode } from 'react';
import { CoursesProvider } from './CoursesContext';
import { StatsProvider } from './StatsContext';
import { AssignmentsProvider } from './AssignmentsContext';
import { SessionsProvider } from './SessionsContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <CoursesProvider>
      <StatsProvider>
        <AssignmentsProvider>
          <SessionsProvider>{children}</SessionsProvider>
        </AssignmentsProvider>
      </StatsProvider>
    </CoursesProvider>
  );
};
