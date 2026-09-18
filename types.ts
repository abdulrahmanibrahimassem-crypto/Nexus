export type GradeTarget = 'A+' | 'A' | 'A-';

export interface Course {
  id: string;
  code: string;
  name: string;
  color: string;
  semester?: string;
  instructor?: string;
  targetGrade?: GradeTarget;
  currentScore?: number;
  credits?: number;
  documentCount?: number;
  iconName?: string;
  backgroundImage?: string;
  sanctuaryTheme?: string;
  title?: string;
  targetScore?: number;
}

export interface DocumentSection {
  title: string;
  pageNumber: number;
  content: string;
  keyPoints?: string[];
}

export interface StudyDocument {
  id: string;
  courseId: string;
  courseCode: string;
  filename: string;
  fileType: 'pdf' | 'pptx' | 'notes';
  uploadDate: string;
  fileSize: string;
  extractedText: string;
  slideCount?: number;
  sections: DocumentSection[];
  summary: string;
  keyTopics: string[];
}

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  sectionIndex?: number;
  selectedText: string;
  highlightColor: 'yellow' | 'green' | 'amber' | 'pink' | 'blue';
  commentText?: string;
  author?: string;
  createdAt: string;
  pageNumber?: number;
}

export interface Flashcard {
  id: string;
  documentId?: string;
  courseId: string;
  courseCode?: string;
  front?: string;
  back?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  masteryLevel?: number; // 0 to 5 (Leitner Box system)
  lastReviewed?: string;
  tag?: string;
  question?: string;
  answer?: string;
  mastery?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionText?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  conceptTested: string;
  difficulty: 'easy' | 'medium' | 'hard';
  documentId?: string;
  documentTitle?: string;
  sectionTitle?: string;
  pageNumber?: number;
  sourceParagraph?: string;
  paragraphIndex?: number;
  relevanceScore?: number;
  keyTopic?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  documentId?: string;
  documentTitle?: string;
  questions: QuizQuestion[];
  createdAt: string;
  bestScore: number;
  totalAttempts: number;
}

export type FlashcardItem = Flashcard;
export type QuizItem = Quiz;

export interface ScheduleEvent {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  type: 'lecture' | 'lab' | 'assignment' | 'exam' | 'study_session' | 'study';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  completed?: boolean;
  cognitiveLoad: 'low' | 'medium' | 'high' | 'light';
  day?: string;
}

export interface TaskItem {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  type: 'assignment' | 'reading' | 'quiz_prep' | 'review' | 'sheet';
  dueDate: string;
  estimatedMinutes: number;
  estimatedMins?: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  aiFeedback?: string;
  studyTechniqueRecommendation?: string;
}

export interface AIStrategy {
  courseId: string;
  courseCode?: string;
  courseName: string;
  targetGrade: string;
  predictedScore: number;
  overview: string;
  studyPhases: {
    phase: string;
    duration: string;
    focus: string;
    keyActions: string[];
  }[];
  weeklyCadence: {
    day: string;
    tasks: string[];
  }[];
  riskBottlenecks: string[];
  highYieldTopics: string[];
}

export interface FeynmanAnalogy {
  concept: string;
  simplifiedExplanation: string;
  childAnalogy: string;
  corePitfall: string;
}

export interface PomodoroBlock {
  blockNumber: number;
  durationMinutes: number;
  task: string;
  targetMilestone: string;
}

export interface StudyTechniqueSet {
  id: string;
  documentId: string;
  documentTitle: string;
  courseCode: string;
  activeRecallPrompts: string[];
  feynmanAnalogies: FeynmanAnalogy[];
  pomodoroPlan: PomodoroBlock[];
  leitnerDistribution: {
    box1Daily: string[];
    box2EveryOtherDay: string[];
    box3Weekly: string[];
  };
}

export interface HabitItem {
  id: string;
  name: string;
  category: 'Study' | 'Health' | 'Mindfulness' | 'Productivity';
  streak: number;
  completedToday: boolean;
  lastCompletedDate?: string;
  targetFrequency: 'Daily' | 'Weekdays' | 'Flexible';
  icon: string;
}

export type ThemeMode =
  | 'rainy'
  | 'stormy'
  | 'focus'
  | 'fun'
  | 'zen'
  | 'cyberpunk'
  | 'space'
  | 'library'
  | 'ocean'
  | 'autumn'
  | 'train'
  | 'late_night_train'
  | 'rainforest'
  | 'blizzard'
  | 'wizard'
  | 'desert'
  | 'vinyl'
  | 'vintage_vinyl_jazz'
  | 'cozy_fireplace'
  | 'cozy_fireplace_lofi'
  | 'deep_space_observatory'
  | 'starlit_desert_night'
  | 'hogwarts'
  | 'bamboo'
  | 'coding'
  | 'greenhouse'
  | 'tokyo_snow'
  | 'waterfall'
  | 'bookstore'
  | 'aurora'
  | 'starlit_desert'
  | 'midnight_dome'
  | 'paris_balcony'
  | 'deep_sea'
  | 'egyptian_temple'
  | 'cyberpunk_loft'
  | 'whispering_pine'
  | 'victorian_storm'
  | 'zen_stone'
  | 'lunar_base';
export type RainIntensity = 'mist' | 'gentle' | 'heavy' | 'deluge';
export type StormLandscape = 'forest' | 'desert';

export type BackgroundInteractionMode = 
  | 'magnetic' 
  | 'fluid_wake' 
  | 'shockwave_ripple' 
  | 'subtle_aurora' 
  | 'stellar_dust'
  | 'disabled';

export type BackgroundTimeOfDay = 'auto' | 'dawn' | 'day' | 'sunset' | 'midnight';

export type CinematicLandscapeTheme = 'forest' | 'desert' | 'mountain';

export interface CinematicLandscapePresetConfig {
  enabled: boolean;
  theme: CinematicLandscapeTheme;
  autoCycle: boolean;
  cycleIntervalSeconds: number; // e.g. 5, 10, 15, 30, 60 (default: 12)
  activeImageIndex?: number;
  motionStyle?: 'ken-burns' | 'ambient-float' | 'still';
  opacity?: number; // 0.2 to 1.0 (default: 0.85)
}

export interface DynamicBackgroundConfig {
  interactionMode: BackgroundInteractionMode;
  motionSpeed: number; // 0.5 to 2.0 (default: 1.0)
  parallaxIntensity: number; // 0.0 to 1.0 (default: 0.6)
  audioReactivity: boolean; // default: true
  timeOfDay: BackgroundTimeOfDay; // default: 'auto'
  bloomResonance: boolean; // 0.1Hz focus breathing pulse (default: true)
  bloomResonanceIntensity?: number; // 0.0 to 2.0 (default: 1.0) Bloom resonance glow intensity of background elements
  particleDensity: number; // 0.5 to 1.5 (default: 1.0)
  sparkleTrails: boolean; // cursor particle wake trail (default: true)
  cinematicDepth?: number; // 0.0 to 2.0 (default: 1.0) Z-axis card float intensity & 3D perspective
  cinematicPreset?: CinematicLandscapePresetConfig;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  color?: string;
  children?: MindMapNode[];
  isExpanded?: boolean;
}

export interface InfographicItem {
  id: string;
  title: string;
  topic: string;
  summary: string;
  type: 'process' | 'comparison' | 'rules' | 'feynman';
  data: {
    steps?: { stepNumber: number; title: string; description: string; tip?: string }[];
    comparison?: {
      conceptA: { name: string; traits: string[] };
      conceptB: { name: string; traits: string[] };
      keyDifference: string;
    };
    goldenRules?: { title: string; rule: string; formulaOrTrap?: string }[];
    feynmanStory?: { childAnalogy: string; simplifiedExplanation: string; coreRule: string };
  };
  createdAt: string;
}

export interface ActiveRecallSession {
  id: string;
  conceptTitle: string;
  prompt: string;
  targetKeyPoints: string[];
  userSubmission: string;
  recallScore: number;
  rememberedPoints: string[];
  missedPoints: string[];
  aiReview: string;
  completedAt: string;
}

export interface SpotifyUserProfile {
  id: string;
  displayName: string;
  email?: string;
  product?: 'premium' | 'free' | 'open';
  imageUrl?: string;
  country?: string;
  followersCount?: number;
}

export type OAuthStage = 
  | 'INIT' 
  | 'CONFIG' 
  | 'AUTH_URL' 
  | 'POPUP' 
  | 'CALLBACK' 
  | 'TOKEN_EXCHANGE' 
  | 'PROFILE' 
  | 'PLAYBACK_POLL' 
  | 'REFRESH' 
  | 'DISCONNECT'
  | 'DIAGNOSTIC';

export interface OAuthLogEntry {
  id: string;
  timestamp: number;
  timeStr: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'step';
  stage: OAuthStage;
  message: string;
  details?: Record<string, any> | string | null;
}

export interface SpotifyTokenExpirationInfo {
  expiresAt: number;
  timeRemainingMs: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  formattedExpiresAt: string;
  formattedRemaining: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  hasRefreshToken: boolean;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session?: boolean;
  is_restricted?: boolean;
  name: string;
  type: string;
  volume_percent?: number;
  supports_volume?: boolean;
}

export interface SpotifyLivePlayback {
  isPlaying: boolean;
  item: {
    id: string;
    name: string;
    artists: { name: string; id?: string }[];
    album: {
      name: string;
      images: { url: string; height?: number; width?: number }[];
    };
    durationMs: number;
    uri: string;
    externalUrl?: string;
    previewUrl?: string;
    isExplicit?: boolean;
  } | null;
  progressMs: number;
  timestamp: number;
  device?: {
    id?: string;
    name: string;
    type: string;
    volumePercent?: number;
    isActive?: boolean;
  };
  shuffleState?: boolean;
  repeatState?: 'off' | 'track' | 'context';
  context?: {
    type?: string;
    uri?: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  spotifyUri: string;
  embedUrl: string;
  previewAudioUrl?: string;
  category: 'synthwave' | 'lofi' | 'binaural' | 'classical' | 'ambient';
  recommendedMode: string;
  bpm?: string;
  recommendedFor?: string;
  artist?: string;
  duration?: string;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  spotifyUri: string;
  embedUrl: string;
  previewAudioUrl?: string;
  spotifyWebUrl?: string;
  genre: 'lofi' | 'classical' | 'ambient' | 'synthwave' | 'binaural' | 'pop' | 'soundtrack' | string;
  category?: string;
  type?: 'track' | 'playlist' | 'album' | 'artist' | string;
  bpm?: string;
  duration: string;
  year?: string;
  previewNote?: string;
}

export interface LyricLine {
  time: number; // timestamp in seconds, e.g. 14.2
  text: string;
}

export interface TrackLyrics {
  trackId?: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  lines: LyricLine[];
  isSynced: boolean;
  isInstrumental?: boolean;
  source?: 'lrclib' | 'curated' | 'fallback' | 'instrumental';
}

export type SpotifyWidgetLayout = 
  | 'compact-bar'       // Sleek, thin bottom or top banner player
  | 'mini-pill'         // Small rounded floating bubble that expands on hover
  | 'immersive-card'    // Full detailed card view with album art, progress bar, tabs & lyrics
  | 'sidebar';          // Vertical stacked card designed for side panels

export type ClockDisplayType = 
  | 'analog-classic'
  | 'analog-chronometer'
  | 'digital-minimal'
  | 'digital-flip'
  | 'digital-cyber'
  | 'digital-zen';

export type DateFormatStyle = 
  | 'full-gregorian'
  | 'academic-term'
  | 'iso-calendar'
  | 'seasonal-lunar'
  | 'compact-badge';

export interface AdaptiveFeedback {
  taskId: string;
  taskTitle: string;
  courseCode: string;
  completionTime: string;
  feedbackText: string;
  loadAdjustment: string;
  projectedReadinessBoost: number;
  nextRecommendedAction: string;
  celebrationType: 'milestone' | 'standard' | 'high_priority';
}

export interface StickyChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type StickyColor = 'latte' | 'espresso' | 'sage' | 'honey' | 'peach' | 'lavender';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: StickyColor;
  tag: string;
  isPinned: boolean;
  checklists: StickyChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type StudyFocusType = 
  | 'deep_work' 
  | 'active_recall' 
  | 'spaced_repetition' 
  | 'problem_set' 
  | 'lecture_review' 
  | 'feynman_technique' 
  | 'pomodoro_sprint';

export interface PlannerBlock {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  subject: string;
  taskTitle: string;
  focusType: StudyFocusType;
  completed: boolean;
  notes?: string;
}

export interface PlannerDailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export type FocusTechniqueId = 'pomodoro' | 'ultradian' | 'rule5217' | 'animedoro' | 'feynman' | 'flowtime' | 'blurting' | 'sq3r';

export interface FocusTechnique {
  id: FocusTechniqueId;
  name: string;
  shortLabel: string;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  description: string;
  tag: string;
  idealFor: string;
  iconName: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  insights: string[];
  gratitudePrompt?: string;
  tomorrowFocus?: string;
  studyMinutes: number;
  completedTasksCount: number;
}

export type AnalyticsTimeframe = 'day' | 'week' | 'month' | 'year';

export interface StudyActivitySession {
  id: string;
  timestamp: string;
  durationMinutes: number;
  technique: FocusTechniqueId;
  courseCode?: string;
  taskTitle?: string;
  documentsProcessedCount?: number;
  cardsReviewedCount?: number;
  quizScore?: number;
  dateStr: string;
  dayName: string;
  hour: number;
}

export interface DiagnosticFailureItem {
  id: string;
  area: string;
  severity: 'critical' | 'moderate' | 'minor';
  title: string;
  symptom: string;
  cognitiveCause: string;
  actionRecommendation: string;
  actionType: 'flashcards' | 'quiz' | 'documents' | 'schedule' | 'technique';
}

export interface FullAcademicReport {
  timeframe: AnalyticsTimeframe;
  generatedAt: string;
  timeframeLabel: string;
  totalFocusedMinutes: number;
  sessionsCompletedCount: number;
  coursesActiveCount: number;
  documentsIngestedCount: number;
  pdfCount: number;
  pptxCount: number;
  notesCount: number;
  cardsReviewedCount: number;
  leitnerBox1Count: number;
  leitnerBox5Count: number;
  retentionRatePercent: number;
  averageQuizScorePercent: number;
  taskCompletionRatePercent: number;
  readinessTrajectoryScore: number;
  strengths: string[];
  failureDiagnostics: DiagnosticFailureItem[];
  pedagogicalTips: { title: string; concept: string; tip: string; action: string }[];
  recommendedFocusTechnique: FocusTechniqueId;
  executiveSummary: string;
}

export interface FinalExamItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm
  location: string;
  durationMinutes: number;
  weightPercent: number; // e.g. 40%
  format: 'Cumulative Exam' | 'Multiple Choice & Essays' | 'Oral & Viva' | 'Practical Coding' | 'Closed Book Written';
  targetGrade: string;
  readinessScore: number; // 0 - 100
  highYieldTopics: string[];
  studyPlanGenerated: boolean;
  notes?: string;
}

export type BadgeShape = 'circle' | 'shield' | 'hexagon' | 'octagon' | 'rosette';
export type BadgeMetal = 'gold' | 'bronze' | 'silver' | 'emerald' | 'obsidian' | 'ruby';

export interface TrophyBadge {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'streak' | 'custom' | 'focus' | 'mastery';
  shape: BadgeShape;
  metal: BadgeMetal;
  icon: string; // Lucide icon name or emoji
  ribbonText?: string;
  sealText?: string;
  milestoneTarget?: string;
  milestoneTargetRemaining?: string;
  unlocked: boolean;
  unlockedDate?: string;
  pinned: boolean;
  courseCode?: string;
  isCustom?: boolean;
}

export type CustomBlockType = 
  | 'header'
  | 'grid'
  | 'checklist'
  | 'habits'
  | 'schedule'
  | 'matrix'
  | 'feynman'
  | 'notes'
  | 'metrics'
  | 'quote'
  | 'table'
  | 'goals'
  | 'image';

export interface BlueprintBrandConfig {
  institutionName: string;
  departmentOrTagline: string;
  authorName: string;
  termDate: string;
  serialNumber: string;
  crest: 'shield' | 'laurel' | 'owl' | 'compass' | 'hexagon' | 'quill' | 'custom';
  customLogoUrl?: string;
  colorPalette: 'sanctuary' | 'oxford' | 'cambridge' | 'harvard' | 'tokyo' | 'blueprint' | 'custom';
  customHexColor?: string;
  customColors?: {
    dark: string;
    border: string;
    accent: string;
    bg: string;
    highlight: string;
    muted: string;
    tagBg: string;
  };
  watermarkText: string;
  showWatermark: boolean;
  showRegistrationMarks: boolean;
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  // Official App Logo & Course Badge header/footer customization
  showOfficialLogo?: boolean;
  officialLogoPosition?: 'header-left' | 'header-right' | 'header-center' | 'footer-left' | 'footer-right';
  officialLogoVariant?: 'sanctuary-crest' | 'golden-laurel' | 'academic-owl' | 'stem-matrix';
  showCourseBadge?: boolean;
  selectedCourseCode?: string;
  selectedCourseName?: string;
  selectedCourseColor?: string;
  courseBadgePosition?: 'header-right' | 'header-left' | 'footer-left' | 'footer-right' | 'header-banner';
  courseBadgeStyle?: 'pill' | 'mono' | 'seal' | 'minimal';
  showFooter?: boolean;
  footerText?: string;
  printPaperStock?: 'crisp-white' | 'linen-cream' | 'blueprint-cyan' | 'sepia-parchment' | 'monochrome';
}

export interface CustomBlueprintBlock {
  id: string;
  type: CustomBlockType;
  title: string;
  subtitle?: string;
  columnSpan: 'full' | 'half';
  span?: 'full' | 'half';
  content?: string;
  // Header template specific fields
  headerTemplate?: 'academic-crest' | 'modern-minimalist' | 'archival-technical' | 'syllabus-banner' | 'compact-split';
  institutionName?: string;
  tagline?: string;
  authorName?: string;
  termDate?: string;
  serialCode?: string;
  crestType?: 'shield' | 'laurel' | 'owl' | 'compass' | 'hexagon' | 'quill' | 'custom';
  logoUrl?: string;
  // Grid specific fields
  gridType?: 'dot-grid' | 'graph-grid' | 'lined-ruled' | 'cornell-notes' | 'eisenhower-grid' | 'habit-grid' | 'isometric-grid';
  gridDensity?: 'fine' | 'medium' | 'broad';
  // Specific block data
  checklistItems?: { id: string; text: string; priority: 'high' | 'medium' | 'low'; est?: string }[];
  blankLinesCount?: number;
  habits?: { id: string; name: string; target?: string }[];
  habitDays?: string[];
  scheduleSlots?: { time: string; activity: string }[];
  matrixQuadrants?: { title: string; subtitle: string; placeholder: string; items?: string[] }[];
  feynmanTopic?: string;
  feynmanPrompt?: string;
  notesStyle?: 'grid' | 'lined' | 'dots' | 'blank';
  notesHeight?: number;
  metricItems?: { label: string; value: string; iconName?: string }[];
  quoteText?: string;
  quoteAuthor?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  goalsList?: { id: string; label: string; target: string; completed?: boolean }[];
  // Image / Diagram / Photo Block data
  imageUrl?: string;
  imageCaption?: string;
  imageFit?: 'contain' | 'cover' | 'fill';
  imageHeight?: number;
}

// ==========================================
// ADVANCED DEV & ACADEMIC WORKSPACE INTERFACES
// ==========================================

export interface AudioScribeNote {
  id: string;
  title: string;
  durationSeconds: number;
  transcript: string;
  summary: string;
  keyTakeaways: string[];
  actionItems: string[];
  generatedFlashcards?: { front: string; back: string }[];
  tags: string[];
  createdAt: string;
  audioBlobUrl?: string;
}

export interface EnergyMoodPlan {
  id: string;
  energyLevel: number; // 1 to 100
  mood: 'focused' | 'calm' | 'tired' | 'energized' | 'stressed' | 'creative';
  recommendedTechnique: string;
  optimalBlockMinutes: number;
  breakDurationMinutes: number;
  recommendedTheme: ThemeMode;
  circadianPhase: 'morning-surge' | 'midday-dip' | 'afternoon-peak' | 'twilight-wind-down' | 'night-owl-flow';
  generatedPlan: {
    timeSlot: string;
    focusType: string;
    description: string;
    duration: number;
  }[];
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: 'javascript' | 'typescript' | 'python' | 'bash' | 'sql' | 'latex' | 'html' | 'json';
  code: string;
  description?: string;
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
}

export interface ApiTestRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  queryParams: { key: string; value: string; enabled: boolean }[];
  body?: string;
  responseStatus?: number;
  responseStatusText?: string;
  responseBody?: string;
  responseTimeMs?: number;
  responseSize?: string;
  lastExecutedAt?: string;
}

export interface DatabaseTableSchema {
  id: string;
  name: string;
  description?: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    foreignRef?: string;
    nullable?: boolean;
  }[];
}

export interface GitMilestone {
  id: string;
  title: string;
  branch: string;
  commitHash: string;
  message: string;
  author: string;
  date: string;
  status: 'completed' | 'in_progress' | 'planned';
  tag?: string;
  tasksLinked?: number;
}

export interface GamifiedQuest {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'review' | 'debug' | 'milestone' | 'wellness';
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  streakMultiplier?: number;
}

export interface AcademicCitation {
  id: string;
  title: string;
  authors: string;
  year: string;
  publisherOrJournal: string;
  volumeIssue?: string;
  doiOrUrl?: string;
  citationType: 'journal' | 'book' | 'website' | 'conference' | 'dataset';
  tags: string[];
  bibtex?: string;
  createdAt: string;
}

export interface PeerResource {
  id: string;
  title: string;
  authorName: string;
  authorInitials: string;
  courseCode: string;
  type: 'flashcards' | 'notes' | 'snippet' | 'solution';
  contentSnippet: string;
  fullContent: string;
  likes: number;
  tags: string[];
  date: string;
  isPinned?: boolean;
}

export interface BugLogEntry {
  id: string;
  title: string;
  courseOrProject: string;
  errorSnippet: string;
  stackTrace?: string;
  rootCause: string;
  solutionSnippet: string;
  status: 'investigating' | 'resolved' | 'reopened';
  tags: string[];
  createdAt: string;
}

export interface GpaCourseEntry {
  id: string;
  code: string;
  name: string;
  credits: number;
  currentPercentage: number;
  letterGrade: string;
  weightCategory?: 'standard' | 'honors' | 'ap_advanced';
  finalExamWeightPercent?: number;
  targetLetterGrade?: string;
}

export interface LogicCanvasNode {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'input_output' | 'state' | 'subroutine';
  x: number;
  y: number;
  color?: string;
  description?: string;
}

export interface LogicCanvasEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  isAnimated?: boolean;
}

