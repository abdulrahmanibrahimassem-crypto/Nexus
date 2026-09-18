import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { FloatingNavbar } from './components/FloatingNavbar';
import { HeaderBrandHero } from './components/HeaderBrandHero';
import { SpotifyWidgetsHub } from './components/SpotifyWidgetsHub';
import { StudyTechniquesStudio } from './components/StudyTechniquesStudio';
import { SanctuaryStudio } from './components/SanctuaryStudio';
import SoftStudyDashboard from './components/SoftStudyDashboard';
import { ZenithCoreWorkspace } from './components/ZenithCoreWorkspace';
import { DashboardOverview } from './components/DashboardOverview';
import { AIStudyAgentHub } from './components/AIStudyAgentHub';
import { AdaptiveSchedule } from './components/AdaptiveSchedule';
import { DocumentManager } from './components/DocumentManager';
import { FlashcardViewer } from './components/FlashcardViewer';
import { QuizInterface } from './components/QuizInterface';
import { SoftStudyAssistantModal } from './components/SoftStudyAssistantModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SpotifyPlayerWidget } from './components/SpotifyPlayerWidget';
import { BackendArchitectureModal } from './components/BackendArchitectureModal';
import { AtmosphericThemeBackdrop } from './components/AtmosphericThemeBackdrop';
import { InteractiveTechniqueSessionModal } from './components/InteractiveTechniqueSessionModal';
import { DailyStudyGoalsModal } from './components/DailyStudyGoalsModal';
import { QuickAddNLPModal } from './components/QuickAddNLPModal';
import { VirtualStudyRoomModal } from './components/VirtualStudyRoomModal';
import { CourseSanctuaryThemeModal } from './components/CourseSanctuaryThemeModal';
import { SmartFocusNotification } from './components/SmartFocusNotification';
import { AssignmentSolverStudio } from './components/AssignmentSolverStudio';
import { NotebookLMStudio } from './components/NotebookLMStudio';
import { UnifiedAgentCommandCenter } from './components/UnifiedAgentCommandCenter';
import { CanvaAndCustomTemplateStudio } from './components/CanvaAndCustomTemplateStudio';
import { CalmBreathingModal } from './components/CalmBreathingModal';
import { GlobalSpotifyPlayerBar } from './components/GlobalSpotifyPlayerBar';
import { UltimateDevAcademicSuite } from './components/UltimateDevAcademicSuite';
import { CyberThreatRadar } from './components/CyberThreatRadar';
import { HardwareIoTBridgeHUD } from './components/HardwareIoTBridgeHUD';
import { OracleHardwareCommander } from './components/OracleHardwareCommander';
import { ModuleErrorBoundary } from './components/common/ModuleErrorBoundary';
import { DynamicBackgroundHUD } from './components/DynamicBackgroundHUD';
import { InstallAppModal } from './components/InstallAppModal';
import { WorkspaceBackupModal } from './components/WorkspaceBackupModal';
import { AgentStudioModal } from './components/AgentStudioModal';
import { Cinematic3DImmersionView } from './components/Cinematic3DImmersionView';

import { BootSequenceSplashScreen } from './components/BootSequenceSplashScreen';
import { CustomDesktopTitleBar } from './components/desktop/CustomDesktopTitleBar';

import { 
  Course, 
  StudyDocument, 
  TaskItem, 
  ScheduleEvent, 
  Flashcard, 
  Quiz, 
  AIStrategy, 
  StudyTechniqueSet, 
  SpotifyPlaylist,
  ThemeMode,
  RainIntensity,
  StormLandscape,
  FocusTechniqueId,
  JournalEntry,
  DynamicBackgroundConfig
} from './types';
import { NavbarFloatMode } from './utils/vibeFloatHelper';
import { FOCUS_TECHNIQUES } from './data/focusTechniques';

import { themeAudio } from './utils/themeAudio';
import { applyThemeTokens } from './utils/themeTokens';

import { 
  initialCourses, 
  initialDocuments, 
  initialTasks, 
  initialScheduleEvents, 
  initialFlashcards, 
  initialQuizzes, 
  initialStrategies, 
  initialTechniques, 
  initialPlaylists,
  COZY_STUDY_PLAYLISTS 
} from './data/initialData';

export default function App() {
  const { user, isLoading, logout } = useAuth();
  const userId = user?.id || 'guest';

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_active_tab_${userId}`);
      if (saved) return saved;
    } catch {}
    return 'desk';
  });

  // Selected course filter (e.g. 'all' or specific course id)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Courses state - user-isolated
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(`soft_study_user_courses_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialCourses; // []
  });

  // Uploaded study documents - user-isolated
  const [documents, setDocuments] = useState<StudyDocument[]>(() => {
    try {
      const saved = localStorage.getItem(`soft_study_user_documents_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialDocuments; // []
  });

  // Academic task queue - user-isolated
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_tasks_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialTasks;
  });

  // Calendar schedule events - user-isolated
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_events_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialScheduleEvents;
  });

  // Flashcards deck - user-isolated
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_flashcards_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialFlashcards;
  });

  // Diagnostic quizzes - user-isolated
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_quizzes_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialQuizzes;
  });

  // AI Strategies and Study Techniques - user-isolated
  const [strategies, setStrategies] = useState<Record<string, AIStrategy>>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_strategies_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialStrategies;
  });

  const [techniques, setTechniques] = useState<Record<string, StudyTechniqueSet>>(() => {
    try {
      const saved = localStorage.getItem(`study_nexus_techniques_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialTechniques;
  });

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isTechniqueModalOpen, setIsTechniqueModalOpen] = useState(false);
  const [isDailyGoalsModalOpen, setIsDailyGoalsModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [isCourseThemeModalOpen, setIsCourseThemeModalOpen] = useState(false);
  const [isCalmBreathingOpen, setIsCalmBreathingOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isBooted, setIsBooted] = useState(false);

  const [navbarFloatMode, setNavbarFloatMode] = useState<NavbarFloatMode>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_navbar_float_mode');
      if (saved) return saved as NavbarFloatMode;
    } catch {}
    return 'sync';
  });

  const handleSelectNavbarFloatMode = (mode: NavbarFloatMode) => {
    setNavbarFloatMode(mode);
    try {
      localStorage.setItem('sanctuary_navbar_float_mode', mode);
    } catch {}
  };

  const handleUpdateCourseTheme = (courseId: string, theme: string, bgGradient: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, sanctuaryTheme: theme, backgroundImage: bgGradient } : c));
  };
  const [dailyGoals, setDailyGoals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_daily_study_goals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['Master core lecture concepts', 'Complete 3 Pomodoro focus cycles', 'Review lecture flashcards'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sanctuary_daily_study_goals', JSON.stringify(dailyGoals));
    } catch {}
  }, [dailyGoals]);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('study_nexus_journal_entries');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'j-1',
        date: new Date().toISOString().split('T')[0],
        title: 'Deep Calculus & Invariant Proofs',
        summary: 'Completed 3 Pomodoro sessions reviewing recurrence relations and master theorem bounds. Felt strong focus and minimal cognitive fatigue.',
        insights: ['Breaking complex proofs into smaller inductive steps speeds up retention.', 'Hydration breaks every 30 minutes maintain stamina.'],
        gratitudePrompt: 'Grateful for clear lecture notes and a quiet sanctuary desk.',
        tomorrowFocus: 'Tackle organic chemistry synthesis and review quiz practice problems.',
        studyMinutes: 120,
        completedTasksCount: 4
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('study_nexus_journal_entries', JSON.stringify(journalEntries));
    } catch {}
  }, [journalEntries]);
  const [lastAiFeedback, setLastAiFeedback] = useState<any>(null);
  const [activeTechniqueId, setActiveTechniqueId] = useState<FocusTechniqueId>('pomodoro');

  // Spotify active playlist
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist>(initialPlaylists[0]);

  // Ambient Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('soft_study_sanctuary_theme');
      if (saved) {
        return saved as ThemeMode;
      }
    } catch {}
    return 'rainy';
  });

  useEffect(() => {
    let animationFrameId: number;
    let idleTimer: number | null = null;
    let hoveredCard: HTMLElement | null = null;

    const clearIdleState = () => {
      if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
      if (hoveredCard) {
        hoveredCard.classList.remove('idle-pulse');
        hoveredCard.removeAttribute('data-idle');
        hoveredCard = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--global-mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--global-mouse-y', `${e.clientY}px`);

        const cards = document.querySelectorAll('.apple-glass-card, .apple-glass, .dark-glass-card, .apple-glass-panel');
        let currentHoveredCard: HTMLElement | null = null;

        cards.forEach((card) => {
          const el = card as HTMLElement;
          const rect = el.getBoundingClientRect();
          const isDirectlyOver = 
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

          if (isDirectlyOver && el.classList.contains('apple-glass-card')) {
            currentHoveredCard = el;
          }

          // Check if cursor is within or reasonably close to the card for specular light tracking
          if (
            e.clientX >= rect.left - 100 &&
            e.clientX <= rect.right + 100 &&
            e.clientY >= rect.top - 100 &&
            e.clientY <= rect.bottom + 100
          ) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
          }
        });

        // Reset previous idle state when mouse moves
        if (hoveredCard && hoveredCard !== currentHoveredCard) {
          hoveredCard.classList.remove('idle-pulse');
          hoveredCard.removeAttribute('data-idle');
        }
        if (idleTimer !== null) {
          clearTimeout(idleTimer);
          idleTimer = null;
        }

        hoveredCard = currentHoveredCard;

        // If mouse is situated over a glass card, start 1.5s idle detection
        if (hoveredCard) {
          hoveredCard.classList.remove('idle-pulse');
          hoveredCard.removeAttribute('data-idle');
          const targetCard = hoveredCard;
          idleTimer = window.setTimeout(() => {
            if (targetCard) {
              targetCard.classList.add('idle-pulse');
              targetCard.setAttribute('data-idle', 'true');
            }
          }, 1500);
        }
      });
    };

    const handlePointerLeave = () => {
      clearIdleState();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearIdleState();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);
  const [isThemeAudioPlaying, setIsThemeAudioPlaying] = useState(false);
  const [themeAudioVolume, setThemeAudioVolume] = useState(0.35);

  // Rain Particles Intensity State ('mist' | 'gentle' | 'heavy' | 'deluge')
  const [rainIntensity, setRainIntensity] = useState<RainIntensity>(() => {
    try {
      const saved = localStorage.getItem('soft_study_rain_intensity');
      if (saved && ['mist', 'gentle', 'heavy', 'deluge'].includes(saved)) {
        return saved as RainIntensity;
      }
    } catch {}
    return 'gentle';
  });

  // Window Glass Droplets Beaded Condensation Toggle
  const [showGlassDroplets, setShowGlassDroplets] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('soft_study_glass_droplets');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Stormy Landscape Setting ('forest' | 'desert')
  const [stormLandscape, setStormLandscape] = useState<StormLandscape>(() => {
    try {
      const saved = localStorage.getItem('soft_study_storm_landscape');
      if (saved && ['forest', 'desert'].includes(saved)) {
        return saved as StormLandscape;
      }
    } catch {}
    return 'forest';
  });

  // Independent Water/Rain Particles Toggle
  const [enableParticles, setEnableParticles] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('soft_study_enable_particles');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Independent Visual Effects Toggle
  const [enableVisualEffects, setEnableVisualEffects] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('soft_study_enable_visual_effects');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Manual Light/Dark Theme Variant State ('light' | 'dark') independent of atmospheric ambient mode
  const [themeVariant, setThemeVariant] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('soft_study_theme_variant');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    applyThemeTokens(currentTheme, themeVariant);
  }, [currentTheme, themeVariant]);

  // Global Glassmorphism Blur Intensity State (0 to 40px)
  const [blurIntensity, setBlurIntensity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('soft_study_blur_intensity');
      if (saved !== null) return parseInt(saved, 10);
    } catch {}
    return 16;
  });

  // Global Glassmorphism Opacity State (0.03 to 0.35)
  const [glassOpacity, setGlassOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('soft_study_glass_opacity');
      if (saved !== null) return parseFloat(saved);
    } catch {}
    return 0.08;
  });

  // Dynamic Backgrounds Physics & Interactivity State
  const [dynamicBgConfig, setDynamicBgConfig] = useState<DynamicBackgroundConfig>(() => {
    try {
      const saved = localStorage.getItem('soft_study_dynamic_bg_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      interactionMode: 'magnetic',
      motionSpeed: 1.0,
      parallaxIntensity: 0.6,
      audioReactivity: true,
      timeOfDay: 'auto',
      bloomResonance: true,
      bloomResonanceIntensity: 1.0,
      particleDensity: 1.0,
      sparkleTrails: true,
      cinematicDepth: 1.0,
      cinematicPreset: {
        enabled: false,
        theme: 'forest',
        autoCycle: true,
        cycleIntervalSeconds: 12,
        activeImageIndex: 0,
        motionStyle: 'ken-burns',
        opacity: 0.85,
      },
    };
  });

  const [isDynamicHUDOpen, setIsDynamicHUDOpen] = useState(false);
  const [isCinematicMode, setIsCinematicMode] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenHUD = () => {
      setIsDynamicHUDOpen(true);
    };
    window.addEventListener('open_dynamic_hud_video', handleOpenHUD);
    window.addEventListener('open_dynamic_hud_cinematic', handleOpenHUD);
    return () => {
      window.removeEventListener('open_dynamic_hud_video', handleOpenHUD);
      window.removeEventListener('open_dynamic_hud_cinematic', handleOpenHUD);
    };
  }, []);

  const handleEnterCinematicMode = () => {
    setIsCinematicMode(true);
    if (!isThemeAudioPlaying) {
      themeAudio.setRainIntensity(rainIntensity);
      themeAudio.start(currentTheme, themeAudioVolume, 1.2);
      setIsThemeAudioPlaying(true);
    }
  };

  const handleExitCinematicMode = () => {
    setIsCinematicMode(false);
  };

  const handleUpdateDynamicBgConfig = (newConfig: DynamicBackgroundConfig) => {
    setDynamicBgConfig(newConfig);
    try {
      localStorage.setItem('soft_study_dynamic_bg_config', JSON.stringify(newConfig));
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem('soft_study_blur_intensity', blurIntensity.toString());
    } catch {}
  }, [blurIntensity]);

  useEffect(() => {
    try {
      localStorage.setItem('soft_study_glass_opacity', glassOpacity.toString());
    } catch {}
  }, [glassOpacity]);

  const handleToggleThemeVariant = (variant: 'light' | 'dark') => {
    setThemeVariant(variant);
    try {
      localStorage.setItem('soft_study_theme_variant', variant);
    } catch {}
  };

  const handleChangeStormLandscape = (landscape: StormLandscape) => {
    setStormLandscape(landscape);
    try {
      localStorage.setItem('soft_study_storm_landscape', landscape);
    } catch {}
    themeAudio.setStormLandscape(landscape);
  };

  const handleToggleParticles = () => {
    setEnableParticles(prev => {
      const next = !prev;
      try {
        localStorage.setItem('soft_study_enable_particles', String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleVisualEffects = () => {
    setEnableVisualEffects(prev => {
      const next = !prev;
      try {
        localStorage.setItem('soft_study_enable_visual_effects', String(next));
      } catch {}
      return next;
    });
  };

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem('soft_study_sanctuary_theme', newTheme);
    } catch {}
    themeAudio.setRainIntensity(rainIntensity);
    if (isThemeAudioPlaying) {
      themeAudio.crossFadeTo(newTheme, 1.5, themeAudioVolume);
    } else {
      themeAudio.start(newTheme, themeAudioVolume, 1.5);
      setIsThemeAudioPlaying(true);
    }
  };

  const handleChangeRainIntensity = (intensity: RainIntensity) => {
    setRainIntensity(intensity);
    try {
      localStorage.setItem('soft_study_rain_intensity', intensity);
    } catch {}
    themeAudio.setRainIntensity(intensity);
  };

  const handleToggleGlassDroplets = () => {
    setShowGlassDroplets(prev => {
      const next = !prev;
      try {
        localStorage.setItem('soft_study_glass_droplets', String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleThemeAudio = () => {
    if (isThemeAudioPlaying) {
      themeAudio.stop(0.8);
      setIsThemeAudioPlaying(false);
    } else {
      themeAudio.setRainIntensity(rainIntensity);
      themeAudio.start(currentTheme, themeAudioVolume, 1.2);
      setIsThemeAudioPlaying(true);
    }
  };

  const handleChangeAudioVolume = (vol: number) => {
    setThemeAudioVolume(vol);
    themeAudio.setVolume(vol);
  };

  // Pomodoro timer state
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'short_break' | 'long_break' | 'coffee_break'>('work');
  const [activeTaskTitle, setActiveTaskTitle] = useState('Deep Study Block');
  const [streakCount, setStreakCount] = useState(3);
  const [totalFocusedMinutes, setTotalFocusedMinutes] = useState(75);

  // Save active tab
  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_active_tab_${userId}`, activeTab);
    } catch {}
  }, [activeTab, userId]);

  // Save courses
  useEffect(() => {
    try {
      localStorage.setItem(`soft_study_user_courses_${userId}`, JSON.stringify(courses));
    } catch {}
  }, [courses, userId]);

  // Save documents
  useEffect(() => {
    try {
      localStorage.setItem(`soft_study_user_documents_${userId}`, JSON.stringify(documents));
    } catch {}
  }, [documents, userId]);

  // Save tasks
  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_tasks_${userId}`, JSON.stringify(tasks));
    } catch {}
  }, [tasks, userId]);

  // Save events
  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_events_${userId}`, JSON.stringify(events));
    } catch {}
  }, [events, userId]);

  // Save flashcards
  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_flashcards_${userId}`, JSON.stringify(flashcards));
    } catch {}
  }, [flashcards, userId]);

  // Save quizzes
  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_quizzes_${userId}`, JSON.stringify(quizzes));
    } catch {}
  }, [quizzes, userId]);

  // Save strategies & techniques
  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_strategies_${userId}`, JSON.stringify(strategies));
    } catch {}
  }, [strategies, userId]);

  useEffect(() => {
    try {
      localStorage.setItem(`study_nexus_techniques_${userId}`, JSON.stringify(techniques));
    } catch {}
  }, [techniques, userId]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isPomodoroRunning) {
      interval = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(prev => prev - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(prev => prev - 1);
          setPomodoroSeconds(59);
        } else {
          // Timer finished
          setIsPomodoroRunning(false);
          if (pomodoroMode === 'work') {
            setStreakCount(prev => prev + 1);
            setTotalFocusedMinutes(prev => prev + 25);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroMinutes, pomodoroSeconds, pomodoroMode]);

  // Calculate A+ Readiness Score dynamically
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length || 1;
  const taskCompletionRatio = completedTasksCount / totalTasksCount;
  const readinessScore = Math.min(100, Math.round(75 + taskCompletionRatio * 23.5));

  // Course handlers
  const handleAddCourse = async (newCourseData: Partial<Course>) => {
    const newCourse: Course = {
      id: `course-${Date.now().toString(36)}`,
      code: newCourseData.code || 'CRS 101',
      name: newCourseData.name || 'New Course',
      color: newCourseData.color || '#06b6d4',
      semester: newCourseData.semester || 'Current Semester',
      instructor: newCourseData.instructor || 'Faculty Professor',
      targetGrade: newCourseData.targetGrade || 'A+',
      currentScore: 94.5,
      credits: newCourseData.credits || 3,
      documentCount: 0,
      iconName: 'BookOpen'
    };

    setCourses(prev => [...prev, newCourse]);

    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
    } catch {}
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setDocuments(prev => prev.filter(d => d.courseId !== courseId));
    setTasks(prev => prev.filter(t => t.courseId !== courseId));
    setEvents(prev => prev.filter(e => e.courseId !== courseId));
  };

  // Document handlers
  const handleUploadDocument = async (fileData: { 
    filename: string; 
    fileType: string; 
    content: string; 
    courseId?: string 
  }) => {
    const course = courses.find(c => c.id === fileData.courseId) || courses[0];
    const newDoc: StudyDocument = {
      id: `doc-${Date.now().toString(36)}`,
      courseId: course?.id || 'general',
      courseCode: course?.code || 'STUDY',
      filename: fileData.filename,
      fileType: fileData.fileType === 'pdf' ? 'pdf' : fileData.fileType === 'pptx' ? 'pptx' : 'notes',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '1.2 MB',
      extractedText: fileData.content,
      slideCount: fileData.fileType === 'pptx' ? 18 : 12,
      keyTopics: ['Core Algorithmic Invariants', 'Active Recall Review', 'Theorem Proofs'],
      summary: fileData.content.substring(0, 300) + '...',
      sections: [
        {
          title: 'Primary Lecture Breakdown',
          pageNumber: 1,
          content: fileData.content,
          keyPoints: ['Core invariant definition', 'Derivation steps and proof bounds']
        }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);

    if (course) {
      setCourses(prev =>
        prev.map(c =>
          c.id === course.id ? { ...c, documentCount: (c.documentCount || 0) + 1 } : c
        )
      );
    }

    try {
      await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course?.id,
          filename: fileData.filename,
          fileType: fileData.fileType,
          textContent: fileData.content,
          fileSize: '1.2 MB'
        })
      });
    } catch {}
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updatedCompleted = !t.completed;
          if (updatedCompleted) {
            setLastAiFeedback({
              taskId: t.id,
              taskTitle: t.title,
              deltaLoad: -14,
              message: `Cognitive recalibration: Completed "${t.title}". Mental bandwidth freed up by 14%. Your next optimal sprint is 25 minutes of Active Recall.`,
              newReadiness: readinessScore + 1.8
            });
          }
          return { 
            ...t, 
            completed: updatedCompleted,
            completedAt: updatedCompleted ? (t.completedAt || new Date().toISOString()) : undefined
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (taskData: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      courseId: taskData.courseId || courses[0]?.id || 'general',
      courseCode: taskData.courseCode || courses[0]?.code || 'STUDY',
      title: taskData.title || 'New Academic Task',
      type: taskData.type || 'assignment',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      estimatedMinutes: taskData.estimatedMinutes || 45,
      completed: false,
      priority: taskData.priority || 'high',
      studyTechniqueRecommendation: taskData.studyTechniqueRecommendation || 'Active Recall Retrieval'
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Calendar event handler
  const handleAddEvent = (newEvent: ScheduleEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  // Pomodoro & Cognitive Focus triggers
  const handleStartPomodoroWithTask = (taskTitle: string) => {
    setActiveTaskTitle(taskTitle);
    setPomodoroMode('work');
    setPomodoroMinutes(25);
    setPomodoroSeconds(0);
    setIsPomodoroRunning(true);
    setIsPomodoroOpen(true);

    // Check if first pomodoro today
    try {
      const lastPomodoroDate = localStorage.getItem('sanctuary_last_pomodoro_date');
      const todayStr = new Date().toISOString().split('T')[0];
      if (lastPomodoroDate !== todayStr) {
        localStorage.setItem('sanctuary_last_pomodoro_date', todayStr);
        setIsDailyGoalsModalOpen(true);
      }
    } catch {}
  };

  const handleStartFocusWithTechnique = (techniqueId: string) => {
    const technique = FOCUS_TECHNIQUES.find(t => t.id === techniqueId) || FOCUS_TECHNIQUES[0];
    setActiveTechniqueId(technique.id);
    setActiveTaskTitle(`${technique.name} (${technique.shortLabel})`);
    setPomodoroMode('work');
    setPomodoroMinutes(technique.focusMinutes);
    setPomodoroSeconds(0);
    setIsTechniqueModalOpen(true);
  };

  // AI Strategy generation
  const handleGenerateStrategy = async (course: Course) => {
    try {
      const res = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, courseName: course.name, courseCode: course.code })
      });
      if (res.ok) {
        const data: AIStrategy = await res.json();
        setStrategies(prev => ({ ...prev, [course.id]: data }));
      }
    } catch {}
  };

  // AI Technique generation
  const handleGenerateTechniques = async (doc: StudyDocument) => {
    try {
      const res = await fetch('/api/ai/active-recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          documentTitle: doc.filename,
          courseCode: doc.courseCode,
          extractedText: doc.extractedText || doc.summary
        })
      });
      if (res.ok) {
        const data: StudyTechniqueSet = await res.json();
        setTechniques(prev => ({ ...prev, [doc.id]: data }));
      }
    } catch {}
  };

  // Flashcards handlers
  const handleUpdateCardMastery = (cardId: string, boxDelta: number) => {
    setFlashcards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          const nextLevel = Math.max(1, Math.min(5, c.masteryLevel + boxDelta));
          return {
            ...c,
            masteryLevel: nextLevel,
            lastReviewed: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );
  };

  const handleGenerateNewCards = async (promptText: string, courseCode: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      courseId: courses.find(c => c.code === courseCode)?.id || 'general',
      courseCode: courseCode || 'STUDY',
      front: promptText.split('?')[0] ? promptText.split('?')[0] + '?' : 'What is the primary theorem or principle in this section?',
      back: 'Direct active recall definition: ' + (promptText.length > 50 ? promptText.substring(0, 150) + '...' : promptText),
      masteryLevel: 1,
      difficulty: 'medium',
      tag: 'AI-Generated'
    };
    setFlashcards(prev => [newCard, ...prev]);
  };

  // Quiz handlers
  const handleCompleteQuiz = (quizId: string, score: number) => {
    setQuizzes(prev =>
      prev.map(q => {
        if (q.id === quizId) {
          return {
            ...q,
            bestScore: Math.max(q.bestScore, score),
            totalAttempts: q.totalAttempts + 1
          };
        }
        return q;
      })
    );
  };

  const handleGenerateQuiz = async (
    text: string, 
    title: string, 
    courseCode: string, 
    docId?: string
  ) => {
    // Find matching document if docId provided or matching by title
    const matchingDoc = documents.find(d => d.id === docId || d.filename === title);
    const resolvedDocId = matchingDoc?.id || docId;
    const resolvedDocTitle = matchingDoc?.filename || title || `${courseCode} Study Notes`;
    
    // Extract sections & paragraphs if document exists
    const docSections = matchingDoc?.sections && matchingDoc.sections.length > 0
      ? matchingDoc.sections
      : [
          {
            title: 'Core Principles & Invariant Derivation',
            pageNumber: 1,
            content: text || 'Optimal sub-structure and state transition invariants form the mathematical foundation of dynamic recurrence and memory optimization.',
            keyPoints: ['Invariant monotonicity', 'Space complexity bound to O(N)']
          },
          {
            title: 'Memory Optimization & State Compaction',
            pageNumber: 2,
            content: 'Space optimization reduces auxiliary heap overhead from O(N^2) to O(N) by retaining only the preceding row checkpoints rather than the exhaustive memoization matrix.',
            keyPoints: ['Preceding row checkpointing', 'Linear auxiliary footprint']
          }
        ];

    const sec1 = docSections[0] || {
      title: 'Core Principles & Invariant Derivation',
      pageNumber: 1,
      content: text || 'Optimal sub-structure holds with strict monotonicity for algorithmic state progression.'
    };
    const sec2 = docSections[1] || docSections[0];

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: title || `${courseCode} Diagnostic Mastery Drill`,
      courseId: courses.find(c => c.code === courseCode)?.id || 'general',
      courseCode: courseCode || 'STUDY',
      documentId: resolvedDocId,
      documentTitle: resolvedDocTitle,
      bestScore: 0,
      totalAttempts: 0,
      createdAt: new Date().toISOString().split('T')[0],
      questions: [
        {
          id: `q-${Date.now()}-1`,
          question: `Regarding ${resolvedDocTitle}: What represents the fundamental invariant property required for correctness?`,
          options: [
            'Optimal sub-structure holds with strict monotonicity.',
            'Greedy choice is locally optimal but global state diverges.',
            'Superposition collapses non-deterministically without bounds.',
            'Amortized cost scales quadratically with respect to vertices.'
          ],
          correctOptionIndex: 0,
          explanation: 'The optimal sub-structure is the invariant property required for correctness and dynamic state relaxation.',
          conceptTested: 'Invariant Derivation',
          difficulty: 'medium',
          documentId: resolvedDocId,
          documentTitle: resolvedDocTitle,
          sectionTitle: sec1.title,
          pageNumber: sec1.pageNumber || 1,
          sourceParagraph: sec1.content.substring(0, 300)
        },
        {
          id: `q-${Date.now()}-2`,
          question: 'How should memory consumption be minimized according to the document principle?',
          options: [
            'Maintain only the previous state array rather than the full 2D matrix.',
            'Compute exhaustive branch recursions without memoization.',
            'Allocate contiguous heap structures on each recursive frame.',
            'Force disk swapping at each iteration boundary.'
          ],
          correctOptionIndex: 0,
          explanation: 'Space optimization reduces auxiliary overhead from O(N^2) to O(N) by retaining only previous row checkpoints.',
          conceptTested: 'Space Complexity Optimization',
          difficulty: 'hard',
          documentId: resolvedDocId,
          documentTitle: resolvedDocTitle,
          sectionTitle: sec2.title,
          pageNumber: sec2.pageNumber || 2,
          sourceParagraph: sec2.content.substring(0, 300)
        }
      ]
    };
    setQuizzes(prev => [newQuiz, ...prev]);
  };

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0908] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <AtmosphericThemeBackdrop 
          theme={currentTheme} 
          rainIntensity={rainIntensity} 
          stormLandscape={stormLandscape}
          showGlassDroplets={showGlassDroplets} 
          enableParticles={enableParticles}
          enableVisualEffects={enableVisualEffects}
          transitionDuration={2.0}
          dynamicConfig={dynamicBgConfig}
        />
        <AuthModal />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen theme-${currentTheme} ${themeVariant === 'dark' ? 'app-dark-mode' : ''} ${activeTab === 'zenith-core' ? 'bg-transparent' : 'bg-[var(--bg-canvas)]'} text-[var(--text-primary)] flex flex-col selection:bg-white/10 selection:text-[#2A241E] relative transition-colors duration-500`}
      style={{ 
        '--glass-blur': `${blurIntensity}px`, 
        '--glass-opacity': glassOpacity,
        '--cinematic-depth': dynamicBgConfig.cinematicDepth ?? 1.0,
        '--card-z-intensity': `${(dynamicBgConfig.cinematicDepth ?? 1.0) * 100}%`,
        '--bloom-resonance-intensity': dynamicBgConfig.bloomResonanceIntensity ?? 1.0,
        '--bg-glow-intensity': `${Math.round((dynamicBgConfig.bloomResonanceIntensity ?? 1.0) * 100)}%`
      } as React.CSSProperties}
    >
      {!isBooted && (
        <BootSequenceSplashScreen onComplete={() => setIsBooted(true)} />
      )}

      {/* Native Desktop Sleek Glassmorphic Title Bar (Draggable in Tauri, Status HUD in Web) */}
      <CustomDesktopTitleBar />

      {/* Global 3D Interactive Mouse Light Spotlight */}
      <div className="global-cursor-3d-light pointer-events-none" aria-hidden="true" />


      {/* Dynamic Atmospheric Environments: Stormy Thunder, Calm Zen Focus, Joyful Garden & Rainy Cafe (Omitted on Zenith Core dedicated workspace to prevent split background conflicts) */}
      {activeTab !== 'zenith-core' && (
        <AtmosphericThemeBackdrop 
          theme={currentTheme} 
          rainIntensity={rainIntensity} 
          stormLandscape={stormLandscape}
          showGlassDroplets={showGlassDroplets} 
          enableParticles={enableParticles}
          enableVisualEffects={enableVisualEffects}
          transitionDuration={2.0}
          isStudySessionActive={isPomodoroRunning}
          sessionTaskTitle={activeTaskTitle}
          dynamicConfig={dynamicBgConfig}
        />
      )}

      {/* 3D CINEMATIC IMMERSION: FULLSCREEN 3D WORLD WITH SPATIAL AUDIO (CARDS DISABLED) */}
      {isCinematicMode ? (
        <Cinematic3DImmersionView
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onExitImmersion={handleExitCinematicMode}
          isAudioPlaying={isThemeAudioPlaying}
          onToggleAudio={handleToggleThemeAudio}
          audioVolume={themeAudioVolume}
          onChangeVolume={handleChangeAudioVolume}
        />
      ) : (
        <>
          {/* Floating Apple Dock Navbar */}
          <FloatingNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            courses={courses}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            pomodoroMinutes={pomodoroMinutes}
            pomodoroSeconds={pomodoroSeconds}
            isPomodoroRunning={isPomodoroRunning}
            onOpenPomodoro={() => setIsPomodoroOpen(true)}
            onOpenSpotify={() => setIsSpotifyOpen(true)}
            onOpenStudyRoom={() => setIsStudyRoomOpen(true)}
            onOpenBackendModal={() => setIsBackendModalOpen(true)}
            onOpenAIAssistant={() => setIsAIModalOpen(true)}
            onStartCoffeeBreak={() => {
              setPomodoroMode('coffee_break');
              setPomodoroMinutes(5);
              setPomodoroSeconds(0);
              setIsPomodoroRunning(true);
              setIsPomodoroOpen(true);
            }}
            onOpenCalmBreathing={() => setIsCalmBreathingOpen(true)}
            currentPlaylistName={currentPlaylist.name}
            readinessScore={readinessScore}
            onOpenDynamicBgHUD={() => setIsDynamicHUDOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            navbarFloatMode={navbarFloatMode}
            onChangeNavbarFloatMode={handleSelectNavbarFloatMode}
            currentTheme={currentTheme}
            onEnterCinematicImmersion={handleEnterCinematicMode}
          />

          {/* Spacious Header Brand Hero with Website Name, Subtitle, 4 Themes & Soundscape controls (omitted on full-screen Zenith Core workspace) */}
          {activeTab !== 'zenith-core' && (
            <HeaderBrandHero
              currentTheme={currentTheme}
              onSelectTheme={handleSelectTheme}
              isAudioPlaying={isThemeAudioPlaying}
              onToggleAudio={handleToggleThemeAudio}
              audioVolume={themeAudioVolume}
              onChangeVolume={handleChangeAudioVolume}
              rainIntensity={rainIntensity}
              onChangeRainIntensity={handleChangeRainIntensity}
              showGlassDroplets={showGlassDroplets}
              onToggleGlassDroplets={handleToggleGlassDroplets}
              stormLandscape={stormLandscape}
              onChangeStormLandscape={handleChangeStormLandscape}
              enableParticles={enableParticles}
              onToggleParticles={handleToggleParticles}
              enableVisualEffects={enableVisualEffects}
              onToggleVisualEffects={handleToggleVisualEffects}
              themeVariant={themeVariant}
              onToggleThemeVariant={handleToggleThemeVariant}
              blurIntensity={blurIntensity}
              onChangeBlurIntensity={setBlurIntensity}
              glassOpacity={glassOpacity}
              onChangeGlassOpacity={setGlassOpacity}
              dynamicConfig={dynamicBgConfig}
              onOpenDynamicHUD={() => setIsDynamicHUDOpen(true)}
              navbarFloatMode={navbarFloatMode}
              onChangeNavbarFloatMode={handleSelectNavbarFloatMode}
              onEnterCinematicImmersion={handleEnterCinematicMode}
            />
          )}

          {/* Main Content Area rendering according to activeTab with Framer Motion layout animations */}
          <main 
            className="flex-1 w-full relative z-10 pb-28"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 30%',
              transformStyle: 'preserve-3d'
            }}
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.995 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
        {/* ZENITH CORE HOLOGRAPHIC DEV WORKSPACE */}
        {activeTab === 'zenith-core' && (
          <ModuleErrorBoundary moduleName="Zenith Core Workspace">
            <ZenithCoreWorkspace />
          </ModuleErrorBoundary>
        )}

        {/* THREAT RADAR & ORACLE AGENT HUD */}
        {activeTab === 'threat-radar' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ModuleErrorBoundary moduleName="Threat Radar & Oracle Agent HUD">
              <CyberThreatRadar />
            </ModuleErrorBoundary>
          </div>
        )}

        {/* HARDWARE & IOT TELEMETRY BRIDGE HUD */}
        {activeTab === 'iot-bridge' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ModuleErrorBoundary moduleName="Hardware & IoT Bridge HUD">
              <HardwareIoTBridgeHUD />
            </ModuleErrorBoundary>
          </div>
        )}

        {/* ORACLE HARDWARE & PROJECT COMMANDER AGENT */}
        {activeTab === 'oracle-hw' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ModuleErrorBoundary moduleName="Oracle Hardware & Project Commander">
              <OracleHardwareCommander />
            </ModuleErrorBoundary>
          </div>
        )}

        {/* 1. COZY DESK VIEW ("A soft place to study" aesthetic with Lo-Fi & Pomodoro) */}
        {activeTab === 'desk' && (
           <SoftStudyDashboard
             courses={courses}
             onAddCourse={handleAddCourse}
             onDeleteCourse={handleDeleteCourse}
             documents={documents}
             onUploadDocument={handleUploadDocument}
             onOpenAIHub={() => setIsAIModalOpen(true)}
             onNavigateTab={(tab) => setActiveTab(tab)}
             onOpenCourseThemeModal={() => setIsCourseThemeModalOpen(true)}
           />
         )}

        {/* 1.2. ULTIMATE DEV & ACADEMIC WORKSPACE SUITE */}
        {(activeTab === 'dev-suite' || activeTab === 'apk-package-hub' || activeTab === 'spec-deconstructor' || activeTab === 'interview-vault' || activeTab === 'bug-logbook' || activeTab === 'group-dashboard' || activeTab === 'effort-estimator' || activeTab === 'typing-dojo' || activeTab === 'portfolio-exporter' || activeTab === 'sql-sandbox' || activeTab === 'peer-programming' || activeTab === 'cloud-estimator' || activeTab === 'workspace-modes' || activeTab === 'crash-decoder' || activeTab === 'ai-companion' || activeTab === 'productivity-roi' || activeTab === 'daily-briefing' || activeTab === 'env-secrets' || activeTab === 'egyptian-tech' || activeTab === 'memory-vis' || activeTab === 'docker-health' || activeTab === 'bug-tracker' || activeTab === 'email-vault' || activeTab === 'energy-velocity' || activeTab === 'vuln-analyzer' || activeTab === 'oral-exam' || activeTab === 'velocity-matrix' || activeTab === 'mock-api' || activeTab === 'bio-tracker' || activeTab === 'workspace-utils' || activeTab === 'system-dev' || activeTab === 'core-quiz-engine' || activeTab === 'elite-arch-scrape' || activeTab === 'cutting-edge-eng' || activeTab === 'cs-roadmaps' || activeTab === 'cs-deep-dive' || activeTab === 'specialized-eng' || activeTab === 'cs-core' || activeTab === 'extended-tools' || activeTab === 'elite-academic' || activeTab === 'workstage-tools' || activeTab === 'advanced-dev' || activeTab === 'engineering-net' || activeTab === 'scribe' || activeTab === 'energy-planner' || activeTab === 'code-sandbox' || activeTab === 'gamified-quests' || activeTab === 'resource-vault' || activeTab === 'logic-canvas') && (
          <UltimateDevAcademicSuite
            courses={courses}
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onAddFlashcard={(card) => setFlashcards(prev => [{ ...card, courseId: (card as any).courseId || courses[0]?.id || 'default', id: `fc-${Date.now()}-${Math.random()}`, masteryLevel: 1, difficulty: 'medium' }, ...prev])}
            onApplyPlan={(blockMinutes, theme, taskLabel) => {
              setCurrentTheme(theme);
              setActiveTaskTitle(taskLabel);
              setPomodoroMode('work');
              setPomodoroMinutes(blockMinutes);
              setPomodoroSeconds(0);
              setIsPomodoroRunning(true);
              setIsPomodoroOpen(true);
            }}
            initialTool={
              activeTab === 'apk-package-hub' ? 'apk-package-hub' :
              activeTab === 'spec-deconstructor' ? 'spec-deconstructor' :
              activeTab === 'interview-vault' ? 'interview-vault' :
              activeTab === 'bug-logbook' ? 'bug-logbook' :
              activeTab === 'group-dashboard' ? 'group-dashboard' :
              activeTab === 'effort-estimator' ? 'effort-estimator' :
              activeTab === 'typing-dojo' ? 'typing-dojo' :
              activeTab === 'portfolio-exporter' ? 'portfolio-exporter' :
              activeTab === 'sql-sandbox' ? 'sql-sandbox' :
              activeTab === 'peer-programming' ? 'peer-programming' :
              activeTab === 'cloud-estimator' ? 'cloud-estimator' :
              activeTab === 'workspace-modes' ? 'workspace-modes' :
              activeTab === 'crash-decoder' ? 'crash-decoder' :
              activeTab === 'ai-companion' ? 'ai-companion' :
              activeTab === 'productivity-roi' ? 'productivity-roi' :
              activeTab === 'daily-briefing' ? 'daily-briefing' :
              activeTab === 'env-secrets' ? 'env-secrets' :
              activeTab === 'egyptian-tech' ? 'egyptian-tech' :
              activeTab === 'memory-vis' ? 'memory-vis' :
              activeTab === 'docker-health' ? 'docker-health' :
              activeTab === 'bug-tracker' ? 'bug-tracker' :
              activeTab === 'email-vault' ? 'email-vault' :
              activeTab === 'energy-velocity' ? 'energy-velocity' :
              activeTab === 'vuln-analyzer' ? 'vuln-analyzer' :
              activeTab === 'oral-exam' ? 'oral-exam' :
              activeTab === 'velocity-matrix' ? 'velocity-matrix' :
              activeTab === 'mock-api' ? 'mock-api' :
              activeTab === 'bio-tracker' ? 'bio-tracker' :
              activeTab === 'workspace-utils' ? 'workspace-utils' :
              activeTab === 'system-dev' ? 'system-dev' :
              activeTab === 'core-quiz-engine' ? 'core-quiz-engine' :
              activeTab === 'elite-arch-scrape' ? 'elite-arch-scrape' :
              activeTab === 'cutting-edge-eng' ? 'cutting-edge-eng' :
              activeTab === 'cs-roadmaps' ? 'cs-roadmaps' :
              activeTab === 'cs-deep-dive' ? 'cs-deep-dive' :
              activeTab === 'specialized-eng' ? 'specialized-eng' :
              activeTab === 'cs-core' ? 'cs-core' :
              activeTab === 'extended-tools' ? 'extended-tools' :
              activeTab === 'elite-academic' ? 'elite-academic' :
              activeTab === 'workstage-tools' ? 'workstage-tools' :
              activeTab === 'advanced-dev' ? 'advanced-dev' :
              activeTab === 'engineering-net' ? 'engineering-net' :
              activeTab === 'scribe' ? 'scribe' :
              activeTab === 'energy-planner' ? 'energy-planner' :
              activeTab === 'code-sandbox' ? 'code-sandbox' :
              activeTab === 'gamified-quests' ? 'gamified-quests' :
              activeTab === 'resource-vault' ? 'resource-vault' :
              activeTab === 'logic-canvas' ? 'logic-canvas' : 'vuln-analyzer'
            }
          />
        )}

        {/* 1.5. AI ASSIGNMENT EXPERT STUDIO (PDF/PPTX Import, Camera Snap, Socratic Hints, Rubric Grading, Twin Practice & NotebookLM Integration) */}
        {activeTab === 'assignments' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AssignmentSolverStudio
              courses={courses}
              documents={documents}
              onAddDocument={(doc) => handleUploadDocument({
                filename: doc.filename,
                fileType: doc.fileType === 'notes' ? 'notes' : 'pdf',
                content: doc.content,
                courseId: doc.courseId
              })}
              onAddFlashcard={(card) => setFlashcards(prev => [{ ...card, id: `fc-${Date.now()}-${Math.random()}`, mastery: 'learning' }, ...prev])}
              onAddTask={handleAddTask}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {/* 1.8. NOTEBOOKLM SOURCE STUDIO (Dual-Host AI Audio Podcast, Source-Grounded Q&A, Briefing Docs, Mind Maps) */}
        {activeTab === 'notebooklm' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <NotebookLMStudio
              documents={documents}
              courses={courses}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAddDocument={(doc) => handleUploadDocument({
                filename: doc.filename,
                fileType: doc.fileType === 'notes' ? 'notes' : 'pdf',
                content: doc.content,
                courseId: doc.courseId
              })}
            />
          </div>
        )}

        {/* 1.9. UNIFIED AI AGENT COMMAND CENTER (Interactive Node Mapping & Multi-Agent Task Pipeline) */}
        {activeTab === 'agent-command-center' && (
          <UnifiedAgentCommandCenter
            courses={courses}
            documents={documents}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* 1.95 CANVA & CUSTOM TEMPLATE STUDIO */}
        {(activeTab === 'canva-studio' || activeTab === 'custom-templates') && (
          <CanvaAndCustomTemplateStudio
            onApplyTemplate={(config) => {
              setActiveTab('blueprint-designer');
            }}
          />
        )}

        {/* 2. SANCTUARY STUDIO (Interactive Whiteboard, Sticky Notes, Daily Planner, Journal, Lecture & Section Capture, Printable Room Studio, Blueprint Designer) */}
        {(activeTab === 'sanctuary-studio' || activeTab === 'whiteboard' || activeTab === 'sticky-notes' || activeTab === 'planner' || activeTab === 'journal' || activeTab === 'lecture-capture' || activeTab === 'printable-studio' || activeTab === 'blueprint-designer') && (
          <SanctuaryStudio
            courses={courses}
            documents={documents}
            initialSubTab={
              activeTab === 'blueprint-designer' ? 'blueprint-designer' :
              activeTab === 'printable-studio' ? 'printable-studio' :
              activeTab === 'lecture-capture' ? 'lecture-capture' :
              activeTab === 'sticky-notes' ? 'notes' :
              activeTab === 'planner' ? 'planner' :
              activeTab === 'journal' ? 'journal' : 'whiteboard'
            }
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAddTask={(task) => setTasks(prev => [{ ...task, id: Date.now().toString() }, ...prev])}
            onToggleTask={handleToggleTask}
            onAddFlashcard={(card) => setFlashcards(prev => [{ ...card, id: Date.now().toString(), mastery: 'learning' }, ...prev])}
            journalEntries={journalEntries}
            onAddJournalEntry={(entry) => setJournalEntries(prev => [entry, ...prev])}
            onDeleteJournalEntry={(id) => setJournalEntries(prev => prev.filter(e => e.id !== id))}
            tasks={tasks}
            onSaveDocument={(doc) => {
              handleUploadDocument({
                filename: doc.filename,
                fileType: (doc.fileType as string) === 'markdown' ? 'notes' : 'pdf',
                content: doc.extractedText || doc.summary,
                courseId: doc.courseId
              });
            }}
          />
        )}

        {/* 3. ADVANCED STUDY TECHNIQUES (Active Recall, Spaced Repetition, Mind Maps, Infographics, Feynman, Focus Protocols) */}
        {activeTab === 'techniques' && (
          <StudyTechniquesStudio
            documents={documents}
            flashcards={flashcards}
            onAddFlashcard={(card) => setFlashcards(prev => [card, ...prev])}
            onUpdateFlashcard={handleUpdateCardMastery}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onStartFocusWithTechnique={handleStartFocusWithTechnique}
          />
        )}

        {/* 4. MULTI-WIDGET SPOTIFY FOCUS DASHBOARD */}
        {activeTab === 'spotify-widgets' && (
          <SpotifyWidgetsHub
            currentPlaylist={currentPlaylist}
            onSelectPlaylist={(p) => setCurrentPlaylist(p)}
            pomodoroMode={pomodoroMode === 'coffee_break' ? 'short_break' : pomodoroMode}
            isPomodoroRunning={isPomodoroRunning}
            onOpenPlayerWidget={() => setIsSpotifyOpen(true)}
          />
        )}

        {/* 4. ACADEMIC COMMAND CENTER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <DashboardOverview
              courses={courses}
              tasks={tasks}
              events={events}
              documents={documents}
              flashcards={flashcards}
              quizzes={quizzes}
              journalEntries={journalEntries}
              onSelectTab={(tab) => setActiveTab(tab)}
              onToggleTask={handleToggleTask}
              onStartPomodoroWithTask={handleStartPomodoroWithTask}
              onStartFocusWithTechnique={handleStartFocusWithTechnique}
              readinessScore={readinessScore}
            />
          </div>
        )}

        {/* 5. AI STUDY AGENTS HUB */}
        {activeTab === 'ai-agents' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AIStudyAgentHub
              courses={courses}
              documents={documents}
              strategies={strategies}
              techniques={techniques}
              onGenerateStrategy={handleGenerateStrategy}
              onGenerateTechniques={handleGenerateTechniques}
              selectedCourseId={selectedCourseId}
            />
          </div>
        )}

        {/* 6. ACADEMIC CALENDAR & ADAPTIVE SCHEDULE (Including Radar, Emergency Planner, Team Hub, Past Exams, Energy Flow) */}
        {(activeTab === 'schedule' || activeTab === 'schedule-radar' || activeTab === 'emergency-planner' || activeTab === 'team-hub' || activeTab === 'past-exams' || activeTab === 'energy-flow') && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AdaptiveSchedule
              tasks={tasks}
              events={events}
              courses={courses}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onAddEvent={handleAddEvent}
              onStartPomodoroWithTask={handleStartPomodoroWithTask}
              lastAiFeedback={lastAiFeedback}
              onCloseAiFeedback={() => setLastAiFeedback(null)}
              selectedCourseId={selectedCourseId}
              initialView={
                activeTab === 'emergency-planner' ? 'emergency' :
                activeTab === 'team-hub' ? 'team' :
                activeTab === 'past-exams' ? 'exams' :
                activeTab === 'energy-flow' ? 'energy' :
                activeTab === 'schedule' ? 'tasks' : 'radar'
              }
            />
          </div>
        )}

        {/* 7. COURSE MATERIALS & DOCUMENT INGESTION (PDF / PPTX) */}
        {activeTab === 'documents' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <DocumentManager
              courses={courses}
              documents={documents}
              onUploadDocument={(newDoc) => setDocuments(prev => [newDoc, ...prev])}
              onDeleteDocument={handleDeleteDocument}
              onGenerateFlashcards={(doc) => {
                handleGenerateNewCards(doc.summary, doc.courseCode);
                setActiveTab('flashcards');
              }}
              onGenerateQuiz={(doc) => {
                handleGenerateQuiz(doc.extractedText || doc.summary, doc.filename, doc.courseCode, doc.id);
                setActiveTab('quizzes');
              }}
              onGenerateTechniques={(doc) => {
                handleGenerateTechniques(doc);
                setActiveTab('ai-agents');
              }}
              selectedCourseId={selectedCourseId}
            />
          </div>
        )}

        {/* 8. LEITNER 5-BOX FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <FlashcardViewer
              cards={flashcards}
              courses={courses}
              onUpdateCardMastery={handleUpdateCardMastery}
              onGenerateNewCards={handleGenerateNewCards}
              selectedCourseId={selectedCourseId}
            />
          </div>
        )}

        {/* 9. DIAGNOSTIC PRACTICE QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <QuizInterface
              quizzes={quizzes}
              courses={courses}
              documents={documents}
              onCompleteQuiz={handleCompleteQuiz}
              onGenerateQuiz={handleGenerateQuiz}
              selectedCourseId={selectedCourseId}
              onNavigateToDocument={() => setActiveTab('documents')}
            />
          </div>
        )}
        </motion.div>
      </main>
    </>
  )}

      {/* GLOBAL MODALS */}
      {/* 1. Socratic AI Study Assistant Modal */}
      <SoftStudyAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        courses={courses}
        documents={documents}
      />

      {/* 2. Pomodoro Deep Work Overlay */}
      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        minutes={pomodoroMinutes}
        seconds={pomodoroSeconds}
        isRunning={isPomodoroRunning}
        mode={pomodoroMode}
        activeTaskTitle={activeTaskTitle}
        onToggleTimer={() => setIsPomodoroRunning(!isPomodoroRunning)}
        onResetTimer={() => {
          setIsPomodoroRunning(false);
          setPomodoroMinutes(
            pomodoroMode === 'work' ? 25 : pomodoroMode === 'coffee_break' ? 5 : pomodoroMode === 'short_break' ? 5 : 15
          );
          setPomodoroSeconds(0);
        }}
        onSetMode={(mode, customMinutes) => {
          setPomodoroMode(mode);
          setIsPomodoroRunning(false);
          const mins = customMinutes || (
            mode === 'work' ? 25 : mode === 'coffee_break' ? 5 : mode === 'short_break' ? 5 : 15
          );
          setPomodoroMinutes(mins);
          setPomodoroSeconds(0);
        }}
        streakCount={streakCount}
        totalFocusedMinutes={totalFocusedMinutes}
        theme={currentTheme}
      />

      {/* 3. Spotify / Lo-fi Focus Player Overlay */}
      <SpotifyPlayerWidget
        isOpen={isSpotifyOpen}
        onClose={() => setIsSpotifyOpen(false)}
        playlists={initialPlaylists}
        currentPlaylist={currentPlaylist}
        onSelectPlaylist={(p) => setCurrentPlaylist(p)}
      />

      {/* 4. Python FastAPI Backend Architecture Inspector */}
      <BackendArchitectureModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />

      {/* 5. Interactive Study Technique Pedagogical Workbench Modal */}
      <InteractiveTechniqueSessionModal
        isOpen={isTechniqueModalOpen}
        onClose={() => setIsTechniqueModalOpen(false)}
        techniqueId={activeTechniqueId}
        courses={courses}
        documents={documents}
        onStartFocusSession={(technique, customMinutes) => {
          setActiveTaskTitle(`${technique.name} (${technique.shortLabel})`);
          setPomodoroMode('work');
          setPomodoroMinutes(customMinutes || technique.focusMinutes);
          setPomodoroSeconds(0);
          setIsPomodoroRunning(true);
          setIsPomodoroOpen(true);
          setIsTechniqueModalOpen(false);
        }}
        onCompleteSession={(minutes, notes) => {
          setTotalFocusedMinutes(prev => prev + minutes);
          setStreakCount(prev => prev + 1);
        }}
      />

      {/* 6. Daily Study Goals Modal */}
      <DailyStudyGoalsModal
        isOpen={isDailyGoalsModalOpen}
        onClose={() => setIsDailyGoalsModalOpen(false)}
        initialGoals={dailyGoals}
        currentStreak={streakCount}
        onUpdateStreak={(newVal) => setStreakCount(newVal)}
        onSaveGoals={(newGoals) => setDailyGoals(newGoals)}
      />

      {/* 7. Quick Add NLP Modal */}
      <QuickAddNLPModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        courses={courses}
        onAddTask={(task) => setTasks(prev => [{ ...task, id: Date.now().toString() }, ...prev])}
        onAddEvent={(evt) => setEvents(prev => [...prev, { ...evt, id: Date.now().toString() }])}
      />

      {/* 8. Virtual Sanctuary Study Room & Global Heatmap Modal */}
      <VirtualStudyRoomModal
        isOpen={isStudyRoomOpen}
        onClose={() => setIsStudyRoomOpen(false)}
        courses={courses}
      />

      {/* 9. Course Sanctuary Custom Background Theme Modal */}
      <CourseSanctuaryThemeModal
        isOpen={isCourseThemeModalOpen}
        onClose={() => setIsCourseThemeModalOpen(false)}
        courses={courses}
        onUpdateCourseTheme={handleUpdateCourseTheme}
        blurIntensity={blurIntensity}
        onUpdateBlurIntensity={setBlurIntensity}
        glassOpacity={glassOpacity}
        onUpdateGlassOpacity={setGlassOpacity}
      />

      {/* 10. Calm 4-7-8 Breathing Stress Reduction Modal */}
      <CalmBreathingModal
        isOpen={isCalmBreathingOpen}
        onClose={() => setIsCalmBreathingOpen(false)}
      />

      {/* 11. Dynamic & Interactive Motional Backgrounds Physics HUD */}
      <DynamicBackgroundHUD
        config={dynamicBgConfig}
        onChangeConfig={handleUpdateDynamicBgConfig}
        isOpen={isDynamicHUDOpen}
        onClose={() => setIsDynamicHUDOpen(false)}
        isStudySessionActive={isPomodoroRunning}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* 12. Smart Focus & Physical Health Notification System */}
      <SmartFocusNotification />

      {/* 13. Android APK & PWA Install Studio Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* 14. Workspace Backup & Data Mobility Modal */}
      <WorkspaceBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        userId={user?.id || 'guest'}
        onDataImported={() => window.location.reload()}
      />

      {/* 15. Global AI Agent Studio & Avatar Voice Matrix Modal */}
      <AgentStudioModal />

      {/* Root-Level Persistent Global Spotify / Lo-Fi Audio Player Bar */}

      <GlobalSpotifyPlayerBar
        onOpenFullPlayer={() => setIsSpotifyOpen(true)}
      />

      {/* Floating Quick Add NLP Trigger Button */}
      {!isCinematicMode && (
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full apple-glass-coffee text-[#FAF7F2] font-semibold text-xs flex items-center space-x-2 shadow-xl hover:scale-105 transition group"
          title="Quick Add Task with NLP"
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            +
          </span>
          <span className="hidden sm:inline pr-1">Quick Add (NLP)</span>
        </button>
      )}
    </div>
  );
}
