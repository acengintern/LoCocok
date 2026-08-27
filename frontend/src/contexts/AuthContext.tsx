'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/api';
import { apiClient, csrf } from '@/lib/api/client';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const refreshUser = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            const response = await apiClient.get('/me');
            setUser(response.data?.data || null);
        } catch (error) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (credentials: any) => {
        await csrf();
        const response = await apiClient.post('/login', credentials);
        const token = response.data?.data?.token;
        if (token && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
        await refreshUser();
    };

    const logout = async () => {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
            }
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
