import { useContext } from 'react';
import { SessionsContext } from '../contexts/SessionsContext';

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
};
