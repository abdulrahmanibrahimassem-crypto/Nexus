import { FocusTechnique } from '../types';

export const FOCUS_TECHNIQUES: FocusTechnique[] = [
  {
    id: 'pomodoro',
    name: 'Classic Pomodoro',
    shortLabel: '25m / 5m',
    focusMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    description: 'The world-standard time-boxing technique. 25 minutes of single-task immersion followed by 5 minutes of mindful mental decompression.',
    tag: 'High Task Volume',
    idealFor: 'Problem sets, flashcard drills, lecture slide reading, and daily task queues.',
    iconName: 'Timer'
  },
  {
    id: 'ultradian',
    name: '90/20 Ultradian Rhythm',
    shortLabel: '90m / 20m',
    focusMinutes: 90,
    breakMinutes: 20,
    longBreakMinutes: 30,
    description: 'Synchronized with natural human biological circadian/ultradian cycles. Peak cognitive beta-wave focus for 90m followed by a deep 20m restorative break.',
    tag: 'Deep Synthesis & Proofs',
    idealFor: 'Complex coding, mathematical proofs, long-form essay drafting, and term research.',
    iconName: 'BrainCircuit'
  },
  {
    id: 'rule5217',
    name: 'The 52/17 Ergonomic Rule',
    shortLabel: '52m / 17m',
    focusMinutes: 52,
    breakMinutes: 17,
    longBreakMinutes: 25,
    description: 'Scientifically validated ergonomic desk ratio documented by the Draugiem Group study. 52 minutes of 100% focused study sprint, then 17 minutes completely detached from screens.',
    tag: 'Desk Ergonomics & Stamina',
    idealFor: 'Long afternoon study sessions, reading technical chapters, and preventing mental fatigue.',
    iconName: 'Zap'
  },
  {
    id: 'animedoro',
    name: 'Animedoro Sprint',
    shortLabel: '45m / 15m',
    focusMinutes: 45,
    breakMinutes: 15,
    longBreakMinutes: 25,
    description: 'A motivation-first study technique developed by students. Work hyper-focused with zero distractions for 45 minutes, rewarded with 15 minutes of an anime episode, musical piece, or walk.',
    tag: 'High Motivation & Flow',
    idealFor: 'Heavy study marathons when burnout is threatening and you need strong dopamine reward anchoring.',
    iconName: 'Sparkles'
  },
  {
    id: 'feynman',
    name: 'Feynman 20-Min Teach-Back',
    shortLabel: '20m / 5m',
    focusMinutes: 20,
    breakMinutes: 5,
    longBreakMinutes: 15,
    description: '20 minutes of intense concept deconstruction, followed by a mandatory 5-minute active verbal teach-back aloud without looking at any notes.',
    tag: 'Active Recall Master',
    idealFor: 'Mastering difficult exam theorems, understanding physiological mechanisms, and uncovering blind spots.',
    iconName: 'PenTool'
  },
  {
    id: 'flowtime',
    name: 'Flowtime Stopwatch',
    shortLabel: 'Open Flow',
    focusMinutes: 50,
    breakMinutes: 10,
    longBreakMinutes: 20,
    description: 'An anxiety-free open timer. You enter the zone without countdown pressure. When your natural attention drifts, you log the time and take a proportional rest (5m rest per 25m work).',
    tag: 'Deep Unconstrained Focus',
    idealFor: 'Creative synthesis, thesis writing, open lab experiments, and students who experience timer anxiety.',
    iconName: 'Clock'
  },
  {
    id: 'blurting',
    name: 'Blurting Method (Sprint)',
    shortLabel: '5m Rapid Recall',
    focusMinutes: 5,
    breakMinutes: 3,
    longBreakMinutes: 10,
    description: '5-minute rapid memory dump on a blank page followed by side-by-side gap comparison against source materials to isolate cognitive blind spots.',
    tag: 'Active Recall Drill',
    idealFor: 'Quick pre-exam cramming, anatomical / physiological pathway testing, and vocabulary recall.',
    iconName: 'Flame'
  },
  {
    id: 'sq3r',
    name: 'SQ3R Reading System',
    shortLabel: '5-Stage Comprehension',
    focusMinutes: 35,
    breakMinutes: 10,
    longBreakMinutes: 20,
    description: 'Structured 5-stage deep reading framework: Survey, Question, Read, Recite, and Review. Transforms passive skimming into active comprehension.',
    tag: 'Deep Text Processing',
    idealFor: 'Textbook chapters, dense scientific papers, literature reviews, and case study deconstruction.',
    iconName: 'BookOpen'
  }
];
