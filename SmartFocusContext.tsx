import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type FocusHealthCategory = 'hydration' | 'eye_rest' | 'posture' | 'breathing' | 'stretch' | 'milestone';

export interface FocusHealthReminder {
  id: string;
  category: FocusHealthCategory;
  minutesThreshold: number; // e.g. 20, 45, 60, 90, 120, 150
  title: string;
  message: string;
  scienceNote: string;
  badgeText: string;
  iconName: string;
  primaryActionLabel: string;
  accentColor: string; // 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'teal'
}

export interface ProtectedFocusBlock {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:30"
  daysOfWeek: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] or ['Daily']
  isActive: boolean;
  autoDnd: boolean;
  courseCode?: string;
  notes?: string;
  createdAt: string;
}

export interface FocusHealthSettings {
  hydrationEnabled: boolean;
  eyeRestEnabled: boolean;
  postureEnabled: boolean;
  breathingEnabled: boolean;
  stretchEnabled: boolean;
  soundEnabled: boolean;
  customIntervals: {
    eyeRestMins: number;
    postureMins: number;
    breathingMins: number;
    hydrationMins: number;
    stretchMins: number;
  };
}

export interface SmartFocusContextType {
  flowDurationSeconds: number;
  flowDurationMinutes: number;
  isFlowActive: boolean;
  alertThresholdMinutes: number;
  isAlertTriggered: boolean;
  activeReminder: FocusHealthReminder | null;
  isBreakModalOpen: boolean;
  hydrationCount: number;
  stretchesCompletedCount: number;
  eyeRestsCompletedCount: number;
  soundEnabled: boolean;
  lastBreakTimestamp: number;
  healthSettings: FocusHealthSettings;

  // DND & Protected Focus Blocks
  isDndActive: boolean;
  protectedFocusBlocks: ProtectedFocusBlock[];
  activeFocusBlock: ProtectedFocusBlock | null;
  
  // Actions
  setIsFlowActive: (active: boolean) => void;
  setAlertThresholdMinutes: (minutes: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  updateHealthSettings: (newSettings: Partial<FocusHealthSettings>) => void;
  triggerAlert: (customReminder?: FocusHealthReminder) => void;
  dismissAlert: () => void;
  snoozeAlert: (minutes?: number) => void;
  openBreakModal: () => void;
  closeBreakModal: () => void;
  logHydration: () => void;
  recordEyeRestBreak: () => void;
  resetFlowSession: () => void;
  recordStretchBreak: () => void;
  simulateThresholdTrigger: (category?: FocusHealthCategory) => void;

  // Protected Focus Block Actions
  toggleDnd: (active?: boolean) => void;
  createProtectedFocusBlock: (block: Omit<ProtectedFocusBlock, 'id' | 'createdAt'>) => void;
  deleteProtectedFocusBlock: (id: string) => void;
  toggleProtectedFocusBlock: (id: string) => void;
  activateFocusBlockNow: (blockId?: string, durationMins?: number, title?: string) => void;
}

// Focus Health Preset Catalog based on cumulative deep work duration
export const FOCUS_HEALTH_MILESTONES: FocusHealthReminder[] = [
  {
    id: 'eye-rest-20',
    category: 'eye_rest',
    minutesThreshold: 20,
    title: '20-20-20 Optic Nerve Relaxation',
    message: 'You have completed 20 minutes of continuous screen focus. Shift your gaze to an object at least 20 feet away for 20 seconds.',
    scienceNote: 'Relaxes the ciliary muscles in your eyes to prevent digital eye strain, dryness, and tension headaches.',
    badgeText: '👁️ 20-20-20 Rule • 20m Focus',
    iconName: 'Eye',
    primaryActionLabel: 'Start 20s Eye Rest',
    accentColor: 'indigo'
  },
  {
    id: 'posture-45',
    category: 'posture',
    minutesThreshold: 45,
    title: 'Ergonomic Spine & Posture Realignment',
    message: '45 minutes of seated deep work. Unclench your jaw, roll your shoulders back, and decompress your thoracic spine.',
    scienceNote: 'Proper spinal alignment increases vertebral blood flow and ensures continuous oxygenation to the cerebral cortex.',
    badgeText: '🧘 Spine Check • 45m Focus',
    iconName: 'Activity',
    primaryActionLabel: 'Quick Posture Check',
    accentColor: 'emerald'
  },
  {
    id: 'breathing-60',
    category: 'breathing',
    minutesThreshold: 60,
    title: '1-Hour Flow State • Mindful Oxygenation',
    message: '1 full hour of focused deep study! Take 3 deep diaphragmatic belly breaths to lower cortisol and reset mental clarity.',
    scienceNote: 'Slow diaphragmatic exhalations stimulate the vagus nerve and sustain executive function without breaking momentum.',
    badgeText: '🌬️ Mindful Breath • 60m Flow',
    iconName: 'Wind',
    primaryActionLabel: 'Take 3 Deep Breaths',
    accentColor: 'teal'
  },
  {
    id: 'hydration-90',
    category: 'hydration',
    minutesThreshold: 90,
    title: 'Hydration Break Suggested',
    message: 'Hydration break suggested after 90 mins of deep work. Brain tissue is 75% water—replenish with a cool glass (250ml) to maintain high synaptic speed.',
    scienceNote: 'A mere 1-2% drop in cellular hydration significantly degrades short-term recall and mathematical processing speeds.',
    badgeText: '💧 Hydration Break • 90m Deep Work',
    iconName: 'Droplets',
    primaryActionLabel: 'Log Water (+250ml)',
    accentColor: 'sky'
  },
  {
    id: 'stretch-120',
    category: 'stretch',
    minutesThreshold: 120,
    title: '2 Hours of Deep Work • Stretch Pause',
    message: 'Outstanding cognitive stamina! 2 hours of deep work completed. Stand up, walk for 2 minutes, and do a quick physical stretch routine.',
    scienceNote: 'Physical movement reverses vascular pooling in the lower extremities and clears adenosine accumulation in the brain.',
    badgeText: '⚡ 2-Hour Milestone • Stretch Pause',
    iconName: 'Heart',
    primaryActionLabel: '5-Min Guided Stretch',
    accentColor: 'amber'
  },
  {
    id: 'milestone-150',
    category: 'milestone',
    minutesThreshold: 150,
    title: 'Cognitive Endurance Threshold Reached',
    message: 'You have sustained high-intensity study for over 2.5 hours. Step away from your desk for a 10-minute restorative recess to consolidate memory.',
    scienceNote: 'Neural memory consolidation occurs during brief non-task rest periods following high-density learning blocks.',
    badgeText: '✨ 150m Milestone • Restorative Break',
    iconName: 'Sparkles',
    primaryActionLabel: 'Take Restorative Walk',
    accentColor: 'rose'
  }
];

const SmartFocusContext = createContext<SmartFocusContextType | undefined>(undefined);

// Web Audio synthesizer for gentle, organic harmonic cues
function playGentleHealthChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Soft two-tone harmonic Solfeggio chime (528 Hz + 660 Hz + 792 Hz)
    const now = ctx.currentTime;
    
    // Fundamental tone (528 Hz - Solfeggio frequency of transformation & clarity)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.06, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.8);

    // Harmonic bell (792 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(792, now + 0.15);
    gain2.gain.setValueAtTime(0.001, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.035, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 2.2);
  } catch {}
}

function playWaterSipSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {}
}

export function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.04, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch {}
}

export const SmartFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayKey = new Date().toISOString().split('T')[0];

  // Flow timer (persisted across soft reloads in current session)
  const [flowDurationSeconds, setFlowDurationSeconds] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('sanctuary_flow_duration_seconds');
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return 0;
  });

  const [isFlowActive, setIsFlowActive] = useState<boolean>(true);
  
  // Alert threshold in minutes (default 90 minutes for deep work hydration)
  const [alertThresholdMinutes, setAlertThresholdMinutesState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_focus_alert_threshold');
      if (saved) return parseInt(saved, 10) || 90;
    } catch {}
    return 90;
  });

  // Health Settings
  const [healthSettings, setHealthSettings] = useState<FocusHealthSettings>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_focus_health_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      hydrationEnabled: true,
      eyeRestEnabled: true,
      postureEnabled: true,
      breathingEnabled: true,
      stretchEnabled: true,
      soundEnabled: true,
      customIntervals: {
        eyeRestMins: 20,
        postureMins: 45,
        breathingMins: 60,
        hydrationMins: 90,
        stretchMins: 120
      }
    };
  });

  const [isAlertTriggered, setIsAlertTriggered] = useState<boolean>(false);
  const [activeReminder, setActiveReminder] = useState<FocusHealthReminder | null>(null);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState<boolean>(false);

  const [hydrationCount, setHydrationCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_hydration_${todayKey}`);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return 3; // Default 3 cups logged for initial warmth
  });

  const [stretchesCompletedCount, setStretchesCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_stretches_${todayKey}`);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return 1;
  });

  const [eyeRestsCompletedCount, setEyeRestsCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_eye_rests_${todayKey}`);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return 2;
  });

  const [lastBreakTimestamp, setLastBreakTimestamp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_last_break_timestamp');
      if (saved) return parseInt(saved, 10) || Date.now();
    } catch {}
    return Date.now();
  });

  // Do Not Disturb & Protected Focus Blocks State
  const [isDndActive, setIsDndActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_dnd_active');
      return saved === 'true';
    } catch {}
    return false;
  });

  const [protectedFocusBlocks, setProtectedFocusBlocks] = useState<ProtectedFocusBlock[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_protected_focus_blocks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    
    return [
      {
        id: 'pfb-1',
        title: 'Morning High-Intensity Deep Work',
        startTime: '09:00',
        endTime: '11:30',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isActive: true,
        autoDnd: true,
        courseCode: 'CS 301',
        notes: 'Protects peak cortisol window for complex theorem derivations & code building.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'pfb-2',
        title: 'Afternoon Exam Review & Problem Sets',
        startTime: '14:00',
        endTime: '16:00',
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        isActive: true,
        autoDnd: true,
        courseCode: 'MATH 240',
        notes: 'Auto-suppresses all notifications during linear algebra drills.',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [activeFocusBlock, setActiveFocusBlock] = useState<ProtectedFocusBlock | null>(null);
  const [manualDndUntil, setManualDndUntil] = useState<number>(0);

  const snoozedUntilRef = useRef<number>(0);
  const triggeredMilestonesRef = useRef<Set<string>>(new Set());

  // Save health settings
  const updateHealthSettings = useCallback((newSettings: Partial<FocusHealthSettings>) => {
    setHealthSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('sanctuary_focus_health_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Sync protected blocks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sanctuary_protected_focus_blocks', JSON.stringify(protectedFocusBlocks));
    } catch {}
  }, [protectedFocusBlocks]);

  // Sync DND active state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sanctuary_dnd_active', String(isDndActive));
    } catch {}
  }, [isDndActive]);

  // Sync flow duration
  useEffect(() => {
    try {
      sessionStorage.setItem('sanctuary_flow_duration_seconds', flowDurationSeconds.toString());
    } catch {}
  }, [flowDurationSeconds]);

  // Check scheduled focus blocks
  useEffect(() => {
    const checkFocusBlocks = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDayName = dayNames[now.getDay()];

      const matchingBlock = protectedFocusBlocks.find(b => {
        if (!b.isActive) return false;
        const dayMatch = b.daysOfWeek.includes('Daily') || 
                         b.daysOfWeek.includes('Today') || 
                         b.daysOfWeek.includes(currentDayName);
        if (!dayMatch) return false;
        return currentTimeStr >= b.startTime && currentTimeStr <= b.endTime;
      });

      if (matchingBlock) {
        setActiveFocusBlock(matchingBlock);
        if (matchingBlock.autoDnd) {
          setIsDndActive(true);
        }
      } else {
        setActiveFocusBlock(null);
        if (now.getTime() > manualDndUntil) {
          setIsDndActive(false);
        }
      }
    };

    checkFocusBlocks();
    const interval = setInterval(checkFocusBlocks, 10000);
    return () => clearInterval(interval);
  }, [protectedFocusBlocks, manualDndUntil]);

  const setAlertThresholdMinutes = (minutes: number) => {
    setAlertThresholdMinutesState(minutes);
    try {
      localStorage.setItem('sanctuary_focus_alert_threshold', minutes.toString());
    } catch {}
  };

  const setSoundEnabled = (enabled: boolean) => {
    updateHealthSettings({ soundEnabled: enabled });
  };

  // Continuous active flow ticking engine with progressive milestone evaluations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFlowActive) {
      interval = setInterval(() => {
        setFlowDurationSeconds(prev => {
          const next = prev + 1;
          const currentMinutes = Math.floor(next / 60);
          const now = Date.now();

          // If snoozed or DND active, skip alert trigger
          if (now < snoozedUntilRef.current || isDndActive) {
            return next;
          }

          // Evaluate which milestones match the current duration
          // Find matching milestone in descending threshold order
          const matchedMilestone = [...FOCUS_HEALTH_MILESTONES]
            .reverse()
            .find(m => {
              // Check if category is enabled in settings
              if (m.category === 'hydration' && !healthSettings.hydrationEnabled) return false;
              if (m.category === 'eye_rest' && !healthSettings.eyeRestEnabled) return false;
              if (m.category === 'posture' && !healthSettings.postureEnabled) return false;
              if (m.category === 'breathing' && !healthSettings.breathingEnabled) return false;
              if (m.category === 'stretch' && !healthSettings.stretchEnabled) return false;

              // Match duration threshold or user-configured threshold
              let threshold = m.minutesThreshold;
              if (m.category === 'hydration') threshold = alertThresholdMinutes || 90;

              return currentMinutes >= threshold && !triggeredMilestonesRef.current.has(m.id);
            });

          if (matchedMilestone && !isAlertTriggered && !isBreakModalOpen) {
            triggeredMilestonesRef.current.add(matchedMilestone.id);
            setActiveReminder(matchedMilestone);
            setIsAlertTriggered(true);
            if (healthSettings.soundEnabled) {
              playGentleHealthChime();
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [
    isFlowActive, 
    alertThresholdMinutes, 
    healthSettings, 
    isDndActive, 
    isAlertTriggered, 
    isBreakModalOpen
  ]);

  const triggerAlert = useCallback((customReminder?: FocusHealthReminder) => {
    const reminder = customReminder || FOCUS_HEALTH_MILESTONES.find(m => m.category === 'hydration') || FOCUS_HEALTH_MILESTONES[3];
    setActiveReminder(reminder);
    if (!isDndActive) {
      setIsAlertTriggered(true);
      if (healthSettings.soundEnabled) {
        playGentleHealthChime();
      }
    }
  }, [healthSettings.soundEnabled, isDndActive]);

  const dismissAlert = useCallback(() => {
    setIsAlertTriggered(false);
    // Buffer before re-triggering the same category
    snoozedUntilRef.current = Date.now() + 15 * 60 * 1000;
  }, []);

  const snoozeAlert = useCallback((minutes: number = 10) => {
    setIsAlertTriggered(false);
    snoozedUntilRef.current = Date.now() + minutes * 60 * 1000;
  }, []);

  const openBreakModal = useCallback(() => {
    setIsAlertTriggered(false);
    setIsBreakModalOpen(true);
  }, []);

  const closeBreakModal = useCallback(() => {
    setIsBreakModalOpen(false);
  }, []);

  const resetFlowSession = useCallback(() => {
    setFlowDurationSeconds(0);
    triggeredMilestonesRef.current.clear();
    setIsAlertTriggered(false);
    setActiveReminder(null);
    setLastBreakTimestamp(Date.now());
    try {
      sessionStorage.setItem('sanctuary_flow_duration_seconds', '0');
      localStorage.setItem('sanctuary_last_break_timestamp', Date.now().toString());
    } catch {}
  }, []);

  const logHydration = useCallback(() => {
    setHydrationCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(`sanctuary_hydration_${todayKey}`, next.toString());
        const savedLogsStr = localStorage.getItem(`sanctuary_hydration_logs_${todayKey}`);
        let logs: { id: string; amountMl: number; timeStr: string }[] = [];
        if (savedLogsStr) {
          try {
            logs = JSON.parse(savedLogsStr);
          } catch {}
        }
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newEntry = {
          id: Date.now().toString(),
          amountMl: 250,
          timeStr
        };
        logs = [newEntry, ...logs];
        localStorage.setItem(`sanctuary_hydration_logs_${todayKey}`, JSON.stringify(logs));

        window.dispatchEvent(new CustomEvent('sanctuary_hydration_updated', {
          detail: { amountMl: 250 }
        }));
      } catch {}
      return next;
    });
    playWaterSipSound();
  }, [todayKey]);

  const recordEyeRestBreak = useCallback(() => {
    setEyeRestsCompletedCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(`sanctuary_eye_rests_${todayKey}`, next.toString());
      } catch {}
      return next;
    });
    playSuccessChime();
  }, [todayKey]);

  const recordStretchBreak = useCallback(() => {
    setStretchesCompletedCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(`sanctuary_stretches_${todayKey}`, next.toString());
      } catch {}
      return next;
    });
    resetFlowSession();
    playSuccessChime();
  }, [todayKey, resetFlowSession]);

  // Simulation helper for testing any Focus Health milestone instantly
  const simulateThresholdTrigger = useCallback((category: FocusHealthCategory = 'hydration') => {
    const reminder = FOCUS_HEALTH_MILESTONES.find(m => m.category === category) || FOCUS_HEALTH_MILESTONES[3];
    // Set duration to threshold minutes * 60
    setFlowDurationSeconds(reminder.minutesThreshold * 60);
    setActiveReminder(reminder);
    setIsAlertTriggered(true);
    if (healthSettings.soundEnabled) {
      playGentleHealthChime();
    }
  }, [healthSettings.soundEnabled]);

  // Protected Focus Block Actions
  const toggleDnd = useCallback((active?: boolean) => {
    setIsDndActive(prev => {
      const next = active !== undefined ? active : !prev;
      if (next) {
        setManualDndUntil(Date.now() + 2 * 60 * 60 * 1000);
      } else {
        setManualDndUntil(0);
      }
      return next;
    });
  }, []);

  const createProtectedFocusBlock = useCallback((block: Omit<ProtectedFocusBlock, 'id' | 'createdAt'>) => {
    const newBlock: ProtectedFocusBlock = {
      ...block,
      id: `pfb-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProtectedFocusBlocks(prev => [newBlock, ...prev]);
  }, []);

  const deleteProtectedFocusBlock = useCallback((id: string) => {
    setProtectedFocusBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const toggleProtectedFocusBlock = useCallback((id: string) => {
    setProtectedFocusBlocks(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  }, []);

  const activateFocusBlockNow = useCallback((blockId?: string, durationMins: number = 60, title?: string) => {
    const now = new Date();
    const end = new Date(now.getTime() + durationMins * 60 * 1000);
    const formatTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const blockTitle = title || "Instant Protected Focus Block";

    let existing = blockId ? protectedFocusBlocks.find(b => b.id === blockId) : null;
    if (existing) {
      setProtectedFocusBlocks(prev => prev.map(b => b.id === blockId ? {
        ...b,
        startTime: formatTime(now),
        endTime: formatTime(end),
        isActive: true,
        autoDnd: true
      } : b));
    } else {
      const newBlock: ProtectedFocusBlock = {
        id: `pfb-${Date.now()}`,
        title: blockTitle,
        startTime: formatTime(now),
        endTime: formatTime(end),
        daysOfWeek: ['Today'],
        isActive: true,
        autoDnd: true,
        notes: 'Instant focus block initiated with Auto-DND active.',
        createdAt: new Date().toISOString()
      };
      setProtectedFocusBlocks(prev => [newBlock, ...prev]);
    }

    setIsDndActive(true);
    setManualDndUntil(end.getTime());
  }, [protectedFocusBlocks]);

  const flowDurationMinutes = Math.floor(flowDurationSeconds / 60);

  return (
    <SmartFocusContext.Provider
      value={{
        flowDurationSeconds,
        flowDurationMinutes,
        isFlowActive,
        alertThresholdMinutes,
        isAlertTriggered,
        activeReminder,
        isBreakModalOpen,
        hydrationCount,
        stretchesCompletedCount,
        eyeRestsCompletedCount,
        soundEnabled: healthSettings.soundEnabled,
        lastBreakTimestamp,
        healthSettings,
        isDndActive,
        protectedFocusBlocks,
        activeFocusBlock,
        setIsFlowActive,
        setAlertThresholdMinutes,
        setSoundEnabled,
        updateHealthSettings,
        triggerAlert,
        dismissAlert,
        snoozeAlert,
        openBreakModal,
        closeBreakModal,
        logHydration,
        recordEyeRestBreak,
        resetFlowSession,
        recordStretchBreak,
        simulateThresholdTrigger,
        toggleDnd,
        createProtectedFocusBlock,
        deleteProtectedFocusBlock,
        toggleProtectedFocusBlock,
        activateFocusBlockNow
      }}
    >
      {children}
    </SmartFocusContext.Provider>
  );
};

export const useSmartFocus = () => {
  const context = useContext(SmartFocusContext);
  if (!context) {
    throw new Error('useSmartFocus must be used within a SmartFocusProvider');
  }
  return context;
};
