export class AgentVoiceManager {
  private static instance: AgentVoiceManager;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeakingNow: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public static getInstance(): AgentVoiceManager {
    if (!AgentVoiceManager.instance) {
      AgentVoiceManager.instance = new AgentVoiceManager();
    }
    return AgentVoiceManager.instance;
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingNow || (this.synth ? this.synth.speaking : false);
  }

  public speak(
    text: string, 
    voiceProfile: string = 'Neural-Alpha (Deep Baritone)', 
    onStart?: () => void, 
    onEnd?: () => void,
    customPitch?: number,
    customRate?: number
  ) {
    if (!this.synth) {
      if (onStart) onStart();
      if (onEnd) setTimeout(onEnd, 1000);
      return;
    }

    // Cancel any ongoing speech
    try {
      this.synth.cancel();
    } catch {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map voice profiles to pitch and rate
    let pitch = customPitch ?? 1.0;
    let rate = customRate ?? 1.0;

    if (customPitch === undefined) {
      if (voiceProfile.includes('Baritone') || voiceProfile.includes('Deep') || voiceProfile.includes('Bass')) {
        pitch = 0.65;
        rate = 0.95;
      } else if (voiceProfile.includes('Soprano') || voiceProfile.includes('Energetic')) {
        pitch = 1.35;
        rate = 1.05;
      } else if (voiceProfile.includes('Cybernetic') || voiceProfile.includes('Gamma') || voiceProfile.includes('Synthesizer')) {
        pitch = 0.85;
        rate = 1.08;
      } else if (voiceProfile.includes('Calm') || voiceProfile.includes('Instructor') || voiceProfile.includes('Soft')) {
        pitch = 0.95;
        rate = 0.92;
      } else if (voiceProfile.includes('Motivator') || voiceProfile.includes('Tactical')) {
        pitch = 1.12;
        rate = 1.05;
      } else if (voiceProfile.includes('Velvet') || voiceProfile.includes('Whisper')) {
        pitch = 0.9;
        rate = 0.88;
      } else if (voiceProfile.includes('Quantum') || voiceProfile.includes('Heavy')) {
        pitch = 0.55;
        rate = 0.9;
      }
    }

    utterance.pitch = Math.max(0.1, Math.min(2.0, pitch));
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));

    // Select an English voice if available
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const preferredVoice = this.voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel') ||
        v.name.includes('Karen') ||
        v.name.includes('Alex')
      )
    ) || this.voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.isSpeakingNow = true;

    utterance.onstart = () => {
      this.isSpeakingNow = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    };

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
      this.isSpeakingNow = false;
    }
  }
}

export const agentVoice = AgentVoiceManager.getInstance();

