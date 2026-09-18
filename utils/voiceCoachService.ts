import { ambientSoundscapeMixer } from './themeAudio';

export type CoachPersona = 'mentor' | 'stoic' | 'zen' | 'energizer';
export type VoiceCoachFrequency = 'auto_milestones' | 'every_10m' | 'every_15m' | 'on_demand_only';

export interface VoiceCoachSettings {
  enabled: boolean;
  persona: CoachPersona;
  frequency: VoiceCoachFrequency;
  volume: number; // 0 to 1
  rate: number; // 0.7 to 1.3
  pitch: number; // 0.8 to 1.2
  playChimeBeforeCue: boolean;
  selectedVoiceName?: string;
  autoSpokenOnKickoff: boolean;
  autoSpokenOnBreak: boolean;
}

export interface SpokenCuePayload {
  script: string;
  themeCategory: 'grounding' | 'encouragement' | 'stamina' | 'breath' | 'transition';
  recommendedAction: string;
  timestamp: number;
}

const DEFAULT_SETTINGS: VoiceCoachSettings = {
  enabled: true,
  persona: 'zen',
  frequency: 'auto_milestones',
  volume: 0.9,
  rate: 0.92, // slightly slower for relaxing, soothing cadence
  pitch: 1.0,
  playChimeBeforeCue: true,
  autoSpokenOnKickoff: true,
  autoSpokenOnBreak: true,
};

class VoiceCoachEngine {
  private settings: VoiceCoachSettings = DEFAULT_SETTINGS;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Array<(cue: SpokenCuePayload | null, isSpeaking: boolean) => void> = [];
  private lastSpokenCue: SpokenCuePayload | null = null;
  private triggeredMilestones = new Set<string>();

  constructor() {
    this.loadSettings();
  }

  public loadSettings(): VoiceCoachSettings {
    try {
      const saved = localStorage.getItem('sanctuary_voice_coach_settings');
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return this.settings;
  }

  public saveSettings(newSettings: Partial<VoiceCoachSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('sanctuary_voice_coach_settings', JSON.stringify(this.settings));
    } catch {}
    this.notify();
  }

  public getSettings(): VoiceCoachSettings {
    return { ...this.settings };
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getLastSpokenCue(): SpokenCuePayload | null {
    return this.lastSpokenCue;
  }

  public subscribe(listener: (cue: SpokenCuePayload | null, isSpeaking: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.lastSpokenCue, this.isSpeaking);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.lastSpokenCue, this.isSpeaking));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const all = window.speechSynthesis.getVoices();
    // Prioritize English natural/neural voices
    return all.filter(v => v.lang.startsWith('en'));
  }

  private selectBestVoice(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return null;

    if (this.settings.selectedVoiceName) {
      const match = voices.find(v => v.name === this.settings.selectedVoiceName);
      if (match) return match;
    }

    // Preferred soothing English voices
    const preferredNames = [
      'Samantha',
      'Karen',
      'Victoria',
      'Google US English',
      'Google UK English Female',
      'Microsoft Zira',
      'Microsoft Jenny Online (Natural)',
      'Daniel',
      'Alex',
      'Natural'
    ];

    for (const name of preferredNames) {
      const found = voices.find(v => v.name.includes(name));
      if (found) return found;
    }

    return voices[0];
  }

  public playGentleGroundingBell() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      
      // Tibetan singing bowl / gentle chime harmonic synthesis (fundamental 432 Hz / 528 Hz love/calm frequency)
      const freqs = [432, 864, 1296];
      const gains = [0.12, 0.04, 0.02];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx] * this.settings.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.6);
      });
    } catch {}
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    ambientSoundscapeMixer.setDucking(false);
    this.notify();
  }

  public async speakCue(cue: SpokenCuePayload, bypassEnabledCheck = false): Promise<void> {
    if (!this.settings.enabled && !bypassEnabledCheck) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stopSpeaking();
    this.lastSpokenCue = cue;
    this.isSpeaking = true;
    this.notify();

    // Play grounding chime if enabled
    if (this.settings.playChimeBeforeCue) {
      this.playGentleGroundingBell();
      await new Promise(r => setTimeout(r, 600)); // slight pause after harmonic chime
    }

    // Duck ambient audio so speech is clear
    ambientSoundscapeMixer.setDucking(true);

    const utterance = new SpeechSynthesisUtterance(cue.script);
    utterance.volume = Math.max(0.1, Math.min(1.0, this.settings.volume));
    utterance.rate = Math.max(0.6, Math.min(1.4, this.settings.rate));
    utterance.pitch = Math.max(0.7, Math.min(1.3, this.settings.pitch));

    const chosenVoice = this.selectBestVoice();
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      ambientSoundscapeMixer.setDucking(false);
      this.notify();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      ambientSoundscapeMixer.setDucking(false);
      this.notify();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public async generateAndSpeak(options: {
    taskTitle?: string;
    sessionMinutes?: number;
    remainingSeconds?: number;
    mode?: 'work' | 'short_break' | 'long_break' | 'coffee_break';
    techniqueName?: string;
    cueType: 'kickoff' | 'grounding' | 'mid_session' | 'stamina_boost' | 'break_transition' | 'pep_talk' | 'posture_reset';
    streakCount?: number;
    forceSpeak?: boolean;
  }): Promise<SpokenCuePayload> {
    try {
      const res = await fetch('/api/ai/voice-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: options.taskTitle,
          sessionMinutes: options.sessionMinutes,
          remainingSeconds: options.remainingSeconds,
          mode: options.mode || 'work',
          techniqueName: options.techniqueName || 'Pomodoro',
          cueType: options.cueType,
          coachPersona: this.settings.persona,
          streakCount: options.streakCount || 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        const payload: SpokenCuePayload = {
          script: data.script,
          themeCategory: data.themeCategory || 'grounding',
          recommendedAction: data.recommendedAction || 'Breathe and center',
          timestamp: Date.now()
        };
        await this.speakCue(payload, options.forceSpeak);
        return payload;
      }
    } catch (e) {
      console.warn('Voice coach API fallback activated:', e);
    }

    // Instant offline fallback
    const fallbackScript = this.getFallbackScript(options.cueType, this.settings.persona);
    const fallbackPayload: SpokenCuePayload = {
      script: fallbackScript.script,
      themeCategory: fallbackScript.themeCategory as any,
      recommendedAction: fallbackScript.recommendedAction,
      timestamp: Date.now()
    };
    await this.speakCue(fallbackPayload, options.forceSpeak);
    return fallbackPayload;
  }

  public resetMilestones() {
    this.triggeredMilestones.clear();
  }

  public checkAutoMilestones(context: {
    isRunning: boolean;
    mode: 'work' | 'short_break' | 'long_break' | 'coffee_break';
    currentMinutes: number;
    currentSeconds: number;
    targetWorkMinutes: number;
    taskTitle: string;
    techniqueName: string;
    streakCount: number;
  }) {
    if (!this.settings.enabled || !context.isRunning || context.mode !== 'work') return;
    if (this.settings.frequency === 'on_demand_only') return;

    const totalSeconds = context.targetWorkMinutes * 60;
    const remainingSeconds = context.currentMinutes * 60 + context.currentSeconds;
    const elapsedSeconds = totalSeconds - remainingSeconds;

    // 1. Kickoff milestone (at 5-10s into session)
    if (elapsedSeconds >= 5 && elapsedSeconds <= 8 && !this.triggeredMilestones.has('kickoff')) {
      if (this.settings.autoSpokenOnKickoff) {
        this.triggeredMilestones.add('kickoff');
        this.generateAndSpeak({
          taskTitle: context.taskTitle,
          sessionMinutes: context.targetWorkMinutes,
          remainingSeconds,
          mode: 'work',
          techniqueName: context.techniqueName,
          cueType: 'kickoff',
          streakCount: context.streakCount
        });
      }
    }

    // 2. Midpoint milestone (around 50% through session)
    const midPointSec = Math.floor(totalSeconds / 2);
    if (elapsedSeconds >= midPointSec && elapsedSeconds <= midPointSec + 3 && !this.triggeredMilestones.has('midpoint')) {
      this.triggeredMilestones.add('midpoint');
      this.generateAndSpeak({
        taskTitle: context.taskTitle,
        sessionMinutes: context.targetWorkMinutes,
        remainingSeconds,
        mode: 'work',
        techniqueName: context.techniqueName,
        cueType: 'mid_session',
        streakCount: context.streakCount
      });
    }

    // 3. Final stamina push (2 minutes remaining)
    if (remainingSeconds <= 120 && remainingSeconds >= 117 && totalSeconds >= 300 && !this.triggeredMilestones.has('final_stretch')) {
      this.triggeredMilestones.add('final_stretch');
      this.generateAndSpeak({
        taskTitle: context.taskTitle,
        sessionMinutes: context.targetWorkMinutes,
        remainingSeconds,
        mode: 'work',
        techniqueName: context.techniqueName,
        cueType: 'stamina_boost',
        streakCount: context.streakCount
      });
    }
  }

  private getFallbackScript(cueType: string, persona: CoachPersona): { script: string; themeCategory: string; recommendedAction: string } {
    const scripts: Record<CoachPersona, Record<string, { script: string; themeCategory: string; recommendedAction: string }>> = {
      zen: {
        grounding: {
          script: "Soften your shoulders and take a slow, diaphragmatic breath. Allow your mind to rest gently on this single task.",
          themeCategory: "breath",
          recommendedAction: "Deep diaphragmatic inhale and exhale"
        },
        kickoff: {
          script: "Welcome to your focus sanctuary. Settle into your seat, release tension, and begin with calm clarity.",
          themeCategory: "breath",
          recommendedAction: "Ground your posture"
        },
        mid_session: {
          script: "Notice how still your mind has become. Keep breathing softly as you continue forward.",
          themeCategory: "grounding",
          recommendedAction: "Relax eye muscles & soften gaze"
        },
        stamina_boost: {
          script: "You are almost at the completion of this block. Stay present and finish with peaceful focus.",
          themeCategory: "stamina",
          recommendedAction: "Wrap up the final thought"
        },
        break_transition: {
          script: "Breathe in deeply, then exhale completely. Step away from the screen and give your eyes rest.",
          themeCategory: "transition",
          recommendedAction: "Step away & hydrate"
        },
        pep_talk: {
          script: "There is no rush and no pressure. Every sentence you read and write is building your quiet mastery.",
          themeCategory: "encouragement",
          recommendedAction: "Trust your process"
        },
        posture_reset: {
          script: "Check in with your body. Lower your shoulders away from your ears and let your spine lengthen naturally.",
          themeCategory: "grounding",
          recommendedAction: "Spinal alignment & neck roll"
        }
      },
      mentor: {
        grounding: {
          script: "Remember, deep work is a practice of patience. Relax your jaw, take a breath, and take it one step at a time.",
          themeCategory: "grounding",
          recommendedAction: "Unclench jaw & breathe"
        },
        kickoff: {
          script: "Let us start this study session strong. You have all the capability you need to grasp these ideas.",
          themeCategory: "encouragement",
          recommendedAction: "Set focused intention"
        },
        mid_session: {
          script: "Halfway point reached. You are making real progress. Keep this steady rhythm going.",
          themeCategory: "encouragement",
          recommendedAction: "Maintain steady pacing"
        },
        stamina_boost: {
          script: "Two minutes to go in this block. Stay with it, you are closing out this session beautifully.",
          themeCategory: "stamina",
          recommendedAction: "Final 120s push"
        },
        break_transition: {
          script: "Well done on this block. Take a well-earned break and let your mind absorb what you have studied.",
          themeCategory: "transition",
          recommendedAction: "Enjoy a restorative break"
        },
        pep_talk: {
          script: "You have shown tremendous dedication today. Be proud of the discipline you are practicing.",
          themeCategory: "encouragement",
          recommendedAction: "Acknowledge growth"
        },
        posture_reset: {
          script: "Lift your chest slightly and roll your shoulders back. Good posture fuels clear thinking.",
          themeCategory: "grounding",
          recommendedAction: "Sit tall & roll shoulders"
        }
      },
      stoic: {
        grounding: {
          script: "Focus only on what is within your control right now. Eliminate distraction and embrace the craft of studying.",
          themeCategory: "grounding",
          recommendedAction: "Filter all external noise"
        },
        kickoff: {
          script: "The session begins. Discipline is the bridge between goals and achievement. Proceed with intention.",
          themeCategory: "encouragement",
          recommendedAction: "Enter focused state"
        },
        mid_session: {
          script: "You have held steady. Do not waver in the middle; stay rooted in the task.",
          themeCategory: "stamina",
          recommendedAction: "Maintain concentration"
        },
        stamina_boost: {
          script: "Final minutes. Finish this block with the same precision with which you started.",
          themeCategory: "stamina",
          recommendedAction: "Execute with precision"
        },
        break_transition: {
          script: "Session concluded. Rest deliberately so you may return with renewed vigor.",
          themeCategory: "transition",
          recommendedAction: "Intentional rest"
        },
        pep_talk: {
          script: "The obstacle in your studies is the path to your comprehension. Persist calmly.",
          themeCategory: "encouragement",
          recommendedAction: "Embrace challenging concepts"
        },
        posture_reset: {
          script: "Ground your feet flat on the floor. Center your body to center your thoughts.",
          themeCategory: "grounding",
          recommendedAction: "Feet flat, centered posture"
        }
      },
      energizer: {
        grounding: {
          script: "Take a huge refreshing breath in, shake out the tension, and let us dive back in with full energy!",
          themeCategory: "breath",
          recommendedAction: "Shake out hands & re-energize"
        },
        kickoff: {
          script: "Time to lock in! You are going to crush this study session today. Let us go!",
          themeCategory: "encouragement",
          recommendedAction: "High energy kickoff"
        },
        mid_session: {
          script: "You are in the zone right now! Keep that energy high and keep conquering those concepts.",
          themeCategory: "encouragement",
          recommendedAction: "Power through the midpoint"
        },
        stamina_boost: {
          script: "Sprint to the finish! Just a couple minutes left, finish this thought with power!",
          themeCategory: "stamina",
          recommendedAction: "Sprint to interval end"
        },
        break_transition: {
          script: "Boom, that focus block is done! Great work, now take a refreshing stretch!",
          themeCategory: "transition",
          recommendedAction: "Celebratory stretch"
        },
        pep_talk: {
          script: "You are on fire today! Keep building that academic streak one session at a time!",
          themeCategory: "encouragement",
          recommendedAction: "Celebrate the momentum"
        },
        posture_reset: {
          script: "Stand up tall for a quick 3-second power posture reset, then get right back to dominating!",
          themeCategory: "grounding",
          recommendedAction: "Power pose reset"
        }
      }
    };

    const personaDict = scripts[persona] || scripts.zen;
    return personaDict[cueType] || personaDict.grounding;
  }
}

export const voiceCoach = new VoiceCoachEngine();
