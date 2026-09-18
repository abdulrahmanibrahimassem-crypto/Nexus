// ============================================================================
// High-Fidelity Multi-Speaker Podcast Audio & Sound Design Engine
// ============================================================================

export interface PodcastSegment {
  speaker: 'Alex' | 'Maya' | string;
  text: string;
  timestamp: string;
  emotion?: string;
  chapterTitle?: string;
  durationSec?: number;
  sourceCitation?: {
    title: string;
    snippet: string;
    pageOrSlide?: string;
  };
}

export interface PodcastEpisode {
  episodeTitle: string;
  durationEst: string;
  episodeSummary: string;
  keyInsights: string[];
  chapters?: Array<{ title: string; startSegmentIdx: number; timestamp: string }>;
  segments: PodcastSegment[];
  quoteOfTheEpisode?: string;
  listenerPrompt?: string;
}

export class PodcastAudioEngine {
  private isPlaying = false;
  private currentSegmentIdx = 0;
  private playbackRate = 1.0;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private ambianceGain: GainNode | null = null;
  private ambianceNoiseNode: AudioNode | null = null;
  private isAmbianceEnabled = true;
  private animationFrameId: number | null = null;

  private alexVoice: SpeechSynthesisVoice | null = null;
  private mayaVoice: SpeechSynthesisVoice | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private episode: PodcastEpisode | null = null;

  // Callbacks
  public onSegmentChange: ((idx: number, segment: PodcastSegment) => void) | null = null;
  public onProgress: ((currentTimeSec: number, totalDurationSec: number, ratio: number) => void) | null = null;
  public onStateChange: ((isPlaying: boolean) => void) | null = null;
  public onFrequencyData: ((data: Uint8Array) => void) | null = null;
  public onWordBoundary: ((word: string, charIndex: number) => void) | null = null;
  public onIntroStart: (() => void) | null = null;
  public onIntroEnd: (() => void) | null = null;
  public activeSpeaker: string = 'Alex';
  private frequencyListeners: Set<(data: Uint8Array) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;

        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);

        this.ambianceGain = this.audioCtx.createGain();
        this.ambianceGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

        this.ambianceGain.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    this.availableVoices = voices;

    if (voices.length > 0) {
      // Find suitable English natural voices
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      
      // Look for natural/neural voices or distinct gendered names
      const femaleCandidates = englishVoices.filter(v => 
        /female|samantha|karen|victoria|zira|jenny|fiona|moira|google us english|alloy/i.test(v.name)
      );
      const maleCandidates = englishVoices.filter(v => 
        /male|daniel|alex|aaron|george|david|guy|ryan|google uk english male|echo/i.test(v.name)
      );

      this.alexVoice = maleCandidates[0] || englishVoices[0] || voices[0];
      this.mayaVoice = femaleCandidates[0] || englishVoices[1] || voices[1] || voices[0];
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  public setCustomVoices(alexVoiceName: string, mayaVoiceName: string) {
    const v1 = this.availableVoices.find(v => v.name === alexVoiceName);
    const v2 = this.availableVoices.find(v => v.name === mayaVoiceName);
    if (v1) this.alexVoice = v1;
    if (v2) this.mayaVoice = v2;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.5, rate));
    if (this.isPlaying && this.currentUtterance) {
      // Restart current segment with new rate seamlessly
      this.speakCurrentSegment();
    }
  }

  public setAmbiance(enabled: boolean) {
    this.isAmbianceEnabled = enabled;
    if (this.ambianceGain && this.audioCtx) {
      this.ambianceGain.gain.setValueAtTime(
        enabled ? 0.04 : 0.0,
        this.audioCtx.currentTime
      );
    }
  }

  // Play a smooth 2.5-second Rhodes chord jingle before episode begins
  public async playIntroJingle(): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.onIntroStart?.();

    const now = ctx.currentTime;
    const chord = [261.63, 329.63, 392.00, 493.88, 587.33]; // Cmaj9 broadcast chime
    
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 2.2);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08 / chord.length, now + idx * 0.08 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + 2.3);
    });

    return new Promise(resolve => {
      setTimeout(() => {
        this.onIntroEnd?.();
        resolve();
      }, 2000);
    });
  }

  // Play a short outro chime
  public playOutroJingle(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [392.00, 493.88, 587.33, 783.99]; // Gmaj9 resolution
    
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.05 / chord.length, now + idx * 0.06 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + 1.9);
    });
  }

  // Start Visualizer Frequency Loop
  private startVisualizerLoop() {
    let phase = 0;
    const update = () => {
      if (this.isPlaying) {
        let buffer: Uint8Array;
        if (this.analyser) {
          const raw = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(raw);
          const hasSignal = raw.some(b => b > 0);
          if (hasSignal) {
            buffer = raw;
          } else {
            buffer = this.generateVoiceCadenceSpectrum(phase);
            phase += 0.08;
          }
        } else {
          buffer = this.generateVoiceCadenceSpectrum(phase);
          phase += 0.08;
        }

        this.onFrequencyData?.(buffer);
        this.frequencyListeners.forEach(listener => {
          try { listener(buffer); } catch (e) {}
        });

        this.animationFrameId = requestAnimationFrame(update);
      }
    };
    update();
  }

  public addFrequencyListener(listener: (data: Uint8Array) => void) {
    this.frequencyListeners.add(listener);
  }

  public removeFrequencyListener(listener: (data: Uint8Array) => void) {
    this.frequencyListeners.delete(listener);
  }

  public getActiveSpeaker(): string {
    return this.activeSpeaker;
  }

  // Generate realistic human voice formants, syllable cadence, and emotional dynamics
  private generateVoiceCadenceSpectrum(phase: number): Uint8Array {
    const isAlex = (this.activeSpeaker || 'Alex').toLowerCase().includes('alex');
    const bins = 48;
    const data = new Uint8Array(bins);
    const now = Date.now() * 0.005;

    // Speech rhythm cadence (syllables oscillate at ~3.5-5.2 Hz)
    const cadenceRate = isAlex ? 5.0 : 4.0;
    const syllablePulse = Math.sin(now * cadenceRate);
    const speechEnergy = Math.max(0.25, (syllablePulse > 0 ? syllablePulse : syllablePulse * 0.25) + 0.65);

    // Formant centers: Alex (energetic, slightly higher register) vs Maya (warm, rich, articulate)
    const f1 = isAlex ? 11 : 8;
    const f2 = isAlex ? 23 : 20;
    const f3 = isAlex ? 35 : 32;

    for (let i = 0; i < bins; i++) {
      // Gaussian acoustic formants
      const d1 = (i - f1) * 0.42;
      const d2 = (i - f2) * 0.35;
      const d3 = (i - f3) * 0.28;
      const formant1 = Math.exp(-d1 * d1) * 1.0;
      const formant2 = Math.exp(-d2 * d2) * 0.75;
      const formant3 = Math.exp(-d3 * d3) * 0.5;

      const baseIntensity = formant1 + formant2 + formant3;
      const harmonicJitter = (Math.sin(now * 14 + i * 1.1) * 0.15) + (Math.random() * 0.12);
      const val = Math.min(255, Math.max(16, Math.floor((baseIntensity + harmonicJitter) * speechEnergy * 195)));
      data[i] = val;
    }
    return data;
  }

  public loadEpisode(episode: PodcastEpisode) {
    this.episode = episode;
    this.currentSegmentIdx = 0;
  }

  public async play(startSegmentIdx = 0, withIntro = false) {
    if (!this.episode || !this.episode.segments || this.episode.segments.length === 0) return;
    
    this.getAudioContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.currentSegmentIdx = Math.max(0, Math.min(this.episode.segments.length - 1, startSegmentIdx));
    this.isPlaying = true;
    this.onStateChange?.(true);
    this.startVisualizerLoop();

    if (withIntro && this.currentSegmentIdx === 0) {
      await this.playIntroJingle();
    }

    this.speakCurrentSegment();
  }

  private speakCurrentSegment() {
    if (!this.isPlaying || !this.episode || !('speechSynthesis' in window)) return;

    const segment = this.episode.segments[this.currentSegmentIdx];
    if (!segment) {
      this.stop();
      return;
    }

    window.speechSynthesis.cancel();
    this.onSegmentChange?.(this.currentSegmentIdx, segment);

    // Calculate approximate overall progress
    const totalSegs = this.episode.segments.length;
    const ratio = totalSegs > 0 ? (this.currentSegmentIdx + 0.5) / totalSegs : 0;
    this.onProgress?.(this.currentSegmentIdx * 35, totalSegs * 35, ratio);

    const utterance = new SpeechSynthesisUtterance(segment.text);
    this.currentUtterance = utterance;

    // Apply Speaker Characteristics
    const isAlex = segment.speaker.toLowerCase().includes('alex');
    this.activeSpeaker = segment.speaker;
    if (isAlex) {
      utterance.voice = this.alexVoice;
      utterance.pitch = 1.08; // Energetic, dynamic inflection
      utterance.rate = this.playbackRate * 1.02;
    } else {
      utterance.voice = this.mayaVoice;
      utterance.pitch = 0.96; // Articulate, deep, warm resonance
      utterance.rate = this.playbackRate * 0.98;
    }

    // Emotion modulations
    if (segment.emotion) {
      const em = segment.emotion.toLowerCase();
      if (em.includes('excite') || em.includes('energetic')) {
        utterance.pitch *= 1.06;
        utterance.rate *= 1.04;
      } else if (em.includes('analytical') || em.includes('insightful')) {
        utterance.pitch *= 0.98;
        utterance.rate *= 0.96;
      } else if (em.includes('curious') || em.includes('puzzled')) {
        utterance.pitch *= 1.04;
      }
    }

    utterance.onend = () => {
      if (!this.isPlaying) return;
      if (this.currentSegmentIdx + 1 < this.episode!.segments.length) {
        this.currentSegmentIdx += 1;
        // Natural conversational pause between hosts (300ms)
        setTimeout(() => {
          if (this.isPlaying) {
            this.speakCurrentSegment();
          }
        }, 320);
      } else {
        // Episode finished!
        this.playOutroJingle();
        this.isPlaying = false;
        this.onStateChange?.(false);
        this.onProgress?.(totalSegs * 35, totalSegs * 35, 1.0);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis segment notice:', e);
      if (this.isPlaying && this.currentSegmentIdx + 1 < this.episode!.segments.length) {
        this.currentSegmentIdx += 1;
        this.speakCurrentSegment();
      } else {
        this.stop();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    this.isPlaying = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.onStateChange?.(false);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public resume() {
    if (!this.episode) return;
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isPlaying = true;
      this.onStateChange?.(true);
      this.startVisualizerLoop();
    } else {
      this.play(this.currentSegmentIdx);
    }
  }

  public stop() {
    this.isPlaying = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.onStateChange?.(false);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public seekToSegment(idx: number, autoPlay = true) {
    if (!this.episode || idx < 0 || idx >= this.episode.segments.length) return;
    this.currentSegmentIdx = idx;
    if (autoPlay || this.isPlaying) {
      this.play(idx);
    } else {
      this.onSegmentChange?.(idx, this.episode.segments[idx]);
    }
  }

  public getCurrentSegmentIdx(): number {
    return this.currentSegmentIdx;
  }

  public getEpisode(): PodcastEpisode | null {
    return this.episode;
  }

  public weaveSegmentsIntoEpisode(insertAtIndex: number, newSegments: PodcastSegment[]) {
    if (!this.episode) return;
    const currentList = [...this.episode.segments];
    const safeIdx = Math.max(0, Math.min(currentList.length, insertAtIndex));
    currentList.splice(safeIdx, 0, ...newSegments);
    this.episode.segments = currentList;
  }

  // Speak a standalone direct explanation aloud (e.g. when explaining an excerpt)
  public speakDirectDialogue(speaker: 'Alex' | 'Maya' | string, text: string, emotion = 'insightful', onComplete?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    this.activeSpeaker = speaker;
    this.getAudioContext();
    window.speechSynthesis.cancel();
    this.isPlaying = true;
    this.onStateChange?.(true);
    this.startVisualizerLoop();

    const utterance = new SpeechSynthesisUtterance(text);
    const isAlex = speaker.toLowerCase().includes('alex');
    if (isAlex) {
      utterance.voice = this.alexVoice;
      utterance.pitch = 1.08;
      utterance.rate = this.playbackRate * 1.02;
    } else {
      utterance.voice = this.mayaVoice;
      utterance.pitch = 0.96;
      utterance.rate = this.playbackRate * 0.98;
    }

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const spokenWord = text.substring(e.charIndex, e.charIndex + (e.charLength || 6));
        this.onWordBoundary?.(spokenWord, e.charIndex);
      }
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.onStateChange?.(false);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      onComplete?.();
    };

    utterance.onerror = () => {
      this.isPlaying = false;
      this.onStateChange?.(false);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      onComplete?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public cancelDirectSpeech() {
    this.isPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.onStateChange?.(false);
  }

  public pauseDirectSpeech() {
    this.isPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.onStateChange?.(false);
  }

  public resumeDirectSpeech() {
    this.isPlaying = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    this.startVisualizerLoop();
    this.onStateChange?.(true);
  }

  public skipForward() {
    if (!this.episode) return;
    const nextIdx = Math.min(this.episode.segments.length - 1, this.currentSegmentIdx + 1);
    this.seekToSegment(nextIdx);
  }

  public skipBackward() {
    if (!this.episode) return;
    const prevIdx = Math.max(0, this.currentSegmentIdx - 1);
    this.seekToSegment(prevIdx);
  }

  // Generate downloadable transcript show notes
  public exportTranscriptText(): string {
    if (!this.episode) return '';
    const header = `========================================================================\n` +
      `NOTEBOOKLM AUDIO OVERVIEW: ${this.episode.episodeTitle.toUpperCase()}\n` +
      `Estimated Runtime: ${this.episode.durationEst}\n` +
      `========================================================================\n\n` +
      `EPISODE SUMMARY:\n${this.episode.episodeSummary}\n\n` +
      `KEY INSIGHTS & TAKEAWAYS:\n` +
      this.episode.keyInsights.map((ins, i) => `${i + 1}. ${ins}`).join('\n') +
      `\n\n------------------------------------------------------------------------\n` +
      `FULL CONVERSATIONAL TRANSCRIPT:\n` +
      `------------------------------------------------------------------------\n\n`;

    const body = this.episode.segments.map((seg, i) => {
      return `[${seg.timestamp}] ${seg.speaker.toUpperCase()} (${seg.emotion || 'spoken'}):\n"${seg.text}"\n`;
    }).join('\n');

    return header + body;
  }
}

// Global Singleton Instance
export const globalPodcastEngine = new PodcastAudioEngine();
