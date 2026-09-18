import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  spotifyConnected: boolean;
  spotifyClientId?: string;
  spotifyTokenExpiresAt?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('study_nexus_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('study_nexus_auth_token');
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => !token);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        try {
          localStorage.setItem('study_nexus_user_profile', JSON.stringify(data.user));
        } catch {}
      } else {
        // If server auto-provisioned or token is valid via backend middleware, keep user
        if (!user) {
          localStorage.removeItem('study_nexus_auth_token');
          localStorage.removeItem('study_nexus_user_profile');
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('study_nexus_auth_token', data.token);
    localStorage.setItem('study_nexus_user_profile', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    localStorage.setItem('study_nexus_auth_token', data.token);
    localStorage.setItem('study_nexus_user_profile', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google authentication failed');
    }
    localStorage.setItem('study_nexus_auth_token', data.token);
    localStorage.setItem('study_nexus_user_profile', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('study_nexus_auth_token');
    localStorage.removeItem('study_nexus_user_profile');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
