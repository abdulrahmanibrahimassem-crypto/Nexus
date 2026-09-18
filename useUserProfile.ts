import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  name: string;
  title: string;
  avatarUrl: string;
  skills: string[];
  goals: string[];
  stats: {
    totalStudyHours: number;
    currentStreak: number;
    completedTasksCount: number;
  };
  preferences: {
    theme: 'dark' | 'light' | 'zenith';
    emailNotifications: boolean;
  };
}

const STORAGE_KEY_USER_PROFILE = 'zenith_core_user_profile_v1';

const defaultProfile: UserProfile = {
  name: 'Alex Sterling',
  title: 'Senior Computer Science & AI Scholar',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  skills: ['TypeScript', 'Algorithms', 'Quantum Computing', 'React', 'Machine Learning'],
  goals: ['Master Advanced Graph Theory', 'Complete 100h Deep Focus', 'Build AI Neural Network'],
  stats: {
    totalStudyHours: 84.5,
    currentStreak: 14,
    completedTasksCount: 42,
  },
  preferences: {
    theme: 'zenith',
    emailNotifications: true,
  },
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return defaultProfile;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    profile,
    updateProfile,
  };
};

export default useUserProfile;
