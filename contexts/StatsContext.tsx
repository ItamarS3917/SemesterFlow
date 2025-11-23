import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserStats } from '../types';
import { INITIAL_USER_STATS } from '../constants';
import { useAuth } from './AuthContext';
import * as FirestoreService from '../services/firestore';

interface StatsContextType {
    userStats: UserStats;
    loading: boolean;
    updateStats: (stats: UserStats) => Promise<void>;
}

export const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setUserStats(INITIAL_USER_STATS);
            setLoading(false);
            return;
        }

        const unsubscribe = FirestoreService.subscribeToUserStats(user.uid, (data) => {
            setUserStats(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updateStats = async (stats: UserStats) => {
        if (user) await FirestoreService.updateUserStatsInDB(user.uid, stats);
    };

    return (
        <StatsContext.Provider value={{ userStats, loading, updateStats }}>
            {children}
        </StatsContext.Provider>
    );
};
