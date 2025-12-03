import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserStats } from '../types';
import { INITIAL_USER_STATS } from '../constants';
import { useAuth } from './AuthContext';
import * as SupabaseDB from '../services/supabaseDB';

interface StatsContextType {
    userStats: UserStats;
    loading: boolean;
    updateStats: (stats: UserStats) => Promise<void>;
    refreshStats: () => Promise<void>;
}

export const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
    const [loading, setLoading] = useState(true);

    const refreshStats = async () => {
        if (!user) return;
        try {
            const data = await SupabaseDB.fetchUserStats(user.uid);
            setUserStats(data);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            setUserStats(INITIAL_USER_STATS);
            setLoading(false);
            return;
        }

        const loadStats = async () => {
            try {
                const data = await SupabaseDB.fetchUserStats(user.uid);
                setUserStats(data);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    const updateStats = async (stats: UserStats) => {
        if (!user) return;
        try {
            await SupabaseDB.updateUserStatsInDB(user.uid, stats);
            await refreshStats();
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error;
        }
    };

    return (
        <StatsContext.Provider value={{ userStats, loading, updateStats, refreshStats }}>
            {children}
        </StatsContext.Provider>
    );
};
