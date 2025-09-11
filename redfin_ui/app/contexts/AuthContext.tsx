"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

interface User {
  id: number;
  memberId: number;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  zipcode?: string;
  address?: string;
  detailAddress?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  interests?: string[]; // 사용자 관심사 필드 추가
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUserFromMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// 사용자 관심사 정보 조회 함수
const fetchUserInterests = async (memberId: number | string, token: string): Promise<string[]> => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const endpoints = [
    `${API_BASE_URL}/api/job-interest?memberId=${memberId}`,
    `${API_BASE_URL}/api/ai-company?memberId=${memberId}`,
    `${API_BASE_URL}/api/ai-field?memberId=${memberId}`
  ];

  try {
    const responses = await Promise.all(endpoints.map(url => fetch(url, { headers })));
    const interests: string[] = [];

    // job-interest
    if (responses[0].ok) {
      const data = await responses[0].json();
      if (data.interest) interests.push(data.interest);
    }
    // ai-company
    if (responses[1].ok) {
      const data = await responses[1].json();
      if (data.aiCompany) interests.push(data.aiCompany);
    }
    // ai-field
    if (responses[2].ok) {
      const data = await responses[2].json();
      if (data.aiField) interests.push(data.aiField);
    }
    
    console.log('Fetched user interests:', interests);
    return interests.filter(Boolean); // null, undefined 등 제거
  } catch (error) {
    console.error('Failed to fetch user interests:', error);
    return [];
  }
};


// MEMBER 테이블에서 사용자 정보 조회 함수
const fetchUserFromMember = async (token: string): Promise<User | null> => {
  try {
    const response = await fetch('/api/users/member', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error('MEMBER 테이블 조회 실패:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.user) {
      // 관심사 정보 추가 조회
      const interests = await fetchUserInterests(data.user.memberId, token);
      return { ...data.user, interests };
    }
    return null;
  } catch (error) {
    console.error('MEMBER 테이블 조회 중 오류:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (isClient) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }, [isClient]);

  const refreshUserFromMember = useCallback(async () => {
    if (!token) {
      console.log('토큰이 없어서 MEMBER 테이블 조회를 건너뜁니다.');
      return;
    }
    const freshUser = await fetchUserFromMember(token);
    if (freshUser) {
      setUser(freshUser);
      if (isClient) {
        localStorage.setItem('auth_user', JSON.stringify(freshUser));
      }
    } else {
      console.warn('MEMBER 테이블에서 사용자 정보를 가져올 수 없습니다.');
    }
  }, [token, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
          setToken(savedToken);
          const freshUser = await fetchUserFromMember(savedToken);
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('auth_user', JSON.stringify(freshUser));
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isClient, logout]);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    // 먼저 기본 유저 정보로 UI 업데이트
    setUser(newUser);
    if (isClient) {
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    }
    // 이후 전체 정보(관심사 포함)를 비동기로 가져와 업데이트
    const freshUser = await fetchUserFromMember(newToken);
    if (freshUser) {
      setUser(freshUser);
      if (isClient) {
        localStorage.setItem('auth_user', JSON.stringify(freshUser));
      }
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (isClient) {
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading,
    login,
    logout,
    updateUser,
    refreshUserFromMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
