// Web Audio API Real Soundscape & HD Theme Synthesizer Engine
import { ThemeMode, RainIntensity, StormLandscape } from '../types';

export class ThemeAudioManager {
  private ctx: AudioContext | null = null;
  private currentTheme: ThemeMode = 'rainy';
  private stormLandscape: StormLandscape = 'forest';
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentChannelGain: GainNode | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.45;
  private baseVolume: number = 0.45;
  private isDucked: boolean = false;
  private activeNodes: AudioNode[] = [];
  private thunderNodes: AudioNode[] = [];
  private intervals: any[] = [];
  private rainIntensity: RainIntensity = 'gentle';
  private thunderListeners: (() => void)[] = [];
  private cachedPinkNoiseBuffer: AudioBuffer | null = null;
  private cachedBrownNoiseBuffer: AudioBuffer | null = null;
  private cachedWhiteNoiseBuffer: AudioBuffer | null = null;
  private lastThunderTime: number = 0;
  private pendingCleanupTimeouts: any[] = [];

  // Independent layer mixer gains
  private ambientLayerGain: number = 0.8;
  private weatherLayerGain: number = 0.9;
  private triggerLayerGain: number = 0.7;

  // 3D Spatial Audio & Binaural HRTF Subsystem
  private spatial3DEnabled: boolean = true;
  private spatialPannerMain: PannerNode | null = null;
  private spatialPannerSky: PannerNode | null = null;
  private spatialPannerOrbit: PannerNode | null = null;
  private spatialPannerHearth: PannerNode | null = null;
  private binauralGain: GainNode | null = null;
  private binauralIntensity: number = 0.35;
  private binauralDelta: number = 10; // 10Hz Alpha waves (432Hz base)
  private binauralOscL: OscillatorNode | null = null;
  private binauralOscR: OscillatorNode | null = null;
  private orbitAngle: number = 0;
  private orbitInterval: any = null;

  public addThunderListener(fn: () => void): () => void {
    this.thunderListeners.push(fn);
    return () => {
      this.thunderListeners = this.thunderListeners.filter(listener => listener !== fn);
    };
  }

  public setRainIntensity(intensity: RainIntensity) {
    const prevIntensity = this.rainIntensity;
    this.rainIntensity = intensity;
    if (this.isRunning && (this.currentTheme === 'rainy' || this.currentTheme === 'stormy') && prevIntensity !== intensity) {
      this.crossFadeTo(this.currentTheme, 2.0, this.volume);
    }
  }

  public getRainIntensity(): RainIntensity {
    return this.rainIntensity;
  }

  public setStormLandscape(landscape: StormLandscape) {
    const prevLandscape = this.stormLandscape;
    this.stormLandscape = landscape;
    if (this.isRunning && this.currentTheme === 'stormy' && prevLandscape !== landscape) {
      this.crossFadeTo('stormy', 2.0, this.volume);
    }
  }

  public getStormLandscape(): StormLandscape {
    return this.stormLandscape;
  }

  public setLayerVolumes(ambient: number, weather: number, trigger: number) {
    this.ambientLayerGain = Math.max(0, Math.min(1, ambient));
    this.weatherLayerGain = Math.max(0, Math.min(1, weather));
    this.triggerLayerGain = Math.max(0, Math.min(1, trigger));
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Initialize 3D Spatial Audio HRTF Architecture
      this.initSpatialAudio();
    }
  }

  private initSpatialAudio() {
    if (!this.ctx || !this.masterGain || this.spatialPannerMain) return;
    try {
      // 1. Primary Environmental 3D HRTF Panner
      this.spatialPannerMain = this.ctx.createPanner();
      this.spatialPannerMain.panningModel = 'HRTF';
      this.spatialPannerMain.distanceModel = 'inverse';
      this.spatialPannerMain.refDistance = 1.0;
      this.spatialPannerMain.maxDistance = 1000;
      this.spatialPannerMain.rolloffFactor = 0.8;
      this.spatialPannerMain.coneInnerAngle = 360;
      this.setNodePosition(this.spatialPannerMain, 0, 0.2, -1.5);
      this.spatialPannerMain.connect(this.masterGain);

      // 2. Sky / Overhead 3D Panner (Rain patter, distant thunder, atmospheric air)
      this.spatialPannerSky = this.ctx.createPanner();
      this.spatialPannerSky.panningModel = 'HRTF';
      this.spatialPannerSky.distanceModel = 'inverse';
      this.setNodePosition(this.spatialPannerSky, 0, 3.2, 0.2);
      this.spatialPannerSky.connect(this.masterGain);

      // 3. 3D Orbiting Atmospheric Panner (Wind currents, celestial sweeps, train rails)
      this.spatialPannerOrbit = this.ctx.createPanner();
      this.spatialPannerOrbit.panningModel = 'HRTF';
      this.spatialPannerOrbit.distanceModel = 'inverse';
      this.setNodePosition(this.spatialPannerOrbit, 2.5, 0.5, 2.0);
      this.spatialPannerOrbit.connect(this.masterGain);

      // 4. Ground / Hearth 3D Panner (Fireplace crackle, garden stream, tea kettle)
      this.spatialPannerHearth = this.ctx.createPanner();
      this.spatialPannerHearth.panningModel = 'HRTF';
      this.spatialPannerHearth.distanceModel = 'inverse';
      this.setNodePosition(this.spatialPannerHearth, -1.8, -1.0, 1.2);
      this.spatialPannerHearth.connect(this.masterGain);

      // Start dynamic 3D spatial orbit animation loop
      this.startSpatialOrbitLoop();

      // Initialize Dual-Ear Binaural Brainwave Entrainment Subsystem
      this.initBinauralSubsystem();
    } catch (err) {
      console.warn('3D Spatial Audio initialization notice:', err);
    }
  }

  private setNodePosition(panner: PannerNode, x: number, y: number, z: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      if (panner.positionX) {
        panner.positionX.setTargetAtTime(x, now, 0.05);
        panner.positionY.setTargetAtTime(y, now, 0.05);
        panner.positionZ.setTargetAtTime(z, now, 0.05);
      } else if ((panner as any).setPosition) {
        (panner as any).setPosition(x, y, z);
      }
    } catch {}
  }

  private startSpatialOrbitLoop() {
    if (this.orbitInterval) clearInterval(this.orbitInterval);
    this.orbitInterval = setInterval(() => {
      if (!this.ctx || !this.spatial3DEnabled || !this.isRunning) return;
      this.orbitAngle += 0.015;
      if (this.orbitAngle > Math.PI * 2) this.orbitAngle -= Math.PI * 2;

      // Orbiting node slowly circles around listener in 3D
      if (this.spatialPannerOrbit) {
        const radius = 3.2;
        const ox = Math.cos(this.orbitAngle) * radius;
        const oz = Math.sin(this.orbitAngle) * radius;
        const oy = Math.sin(this.orbitAngle * 1.5) * 0.8 + 0.5;
        this.setNodePosition(this.spatialPannerOrbit, ox, oy, oz);
      }
    }, 100);
  }

  private initBinauralSubsystem() {
    if (!this.ctx || !this.masterGain || this.binauralGain) return;
    try {
      const merger = this.ctx.createChannelMerger(2);
      this.binauralGain = this.ctx.createGain();
      this.binauralGain.gain.setValueAtTime(this.binauralIntensity * 0.08, this.ctx.currentTime);

      const baseFreq = 432;
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(baseFreq + this.binauralDelta, this.ctx.currentTime);

      const gainL = this.ctx.createGain();
      gainL.gain.setValueAtTime(0.5, this.ctx.currentTime);
      const gainR = this.ctx.createGain();
      gainR.gain.setValueAtTime(0.5, this.ctx.currentTime);

      oscL.connect(gainL);
      gainL.connect(merger, 0, 0); // Left channel

      oscR.connect(gainR);
      gainR.connect(merger, 0, 1); // Right channel

      merger.connect(this.binauralGain);
      this.binauralGain.connect(this.masterGain);

      oscL.start();
      oscR.start();

      this.binauralOscL = oscL;
      this.binauralOscR = oscR;
    } catch {}
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private createPinkNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.cachedPinkNoiseBuffer) return this.cachedPinkNoiseBuffer;

    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.cachedPinkNoiseBuffer = buffer;
    return buffer;
  }

  private createBrownNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.cachedBrownNoiseBuffer) return this.cachedBrownNoiseBuffer;

    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    this.cachedBrownNoiseBuffer = buffer;
    return buffer;
  }

  private createWhiteNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.cachedWhiteNoiseBuffer) return this.cachedWhiteNoiseBuffer;

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.cachedWhiteNoiseBuffer = buffer;
    return buffer;
  }

  /**
   * Smoothly cross-fades from the current audio soundscape to a new theme over 1.5-2.0 seconds,
   * completely eliminating any audio pops, clicks, or abrupt cutoffs.
   */
  public crossFadeTo(newTheme: ThemeMode, durationSec: number = 1.5, targetVolume?: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (targetVolume !== undefined) {
      this.baseVolume = Math.max(0, Math.min(1, targetVolume));
      const targetMultiplier = this.isDucked ? 0.8 : 1.0;
      this.volume = this.baseVolume * targetMultiplier;
    }

    const now = this.ctx.currentTime;
    const fadeDuration = Math.max(0.6, durationSec);

    // Stop and clear any previous recurring intervals immediately
    this.intervals.forEach(t => clearInterval(t));
    this.intervals = [];

    // Clear previous thunder nodes if any
    this.thunderNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
        if ('disconnect' in node && typeof (node as any).disconnect === 'function') (node as any).disconnect();
      } catch {}
    });
    this.thunderNodes = [];

    if (this.isRunning && this.currentChannelGain) {
      const oldChannelGain = this.currentChannelGain;
      const oldNodes = [...this.activeNodes];

      try {
        oldChannelGain.gain.cancelScheduledValues(now);
        oldChannelGain.gain.setValueAtTime(oldChannelGain.gain.value, now);
        oldChannelGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
      } catch {}

      const timeoutId = setTimeout(() => {
        oldNodes.forEach(node => {
          try {
            if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
            if ('disconnect' in node && typeof (node as any).disconnect === 'function') (node as any).disconnect();
          } catch {}
        });
        try { oldChannelGain.disconnect(); } catch {}
      }, (fadeDuration + 0.15) * 1000);
      this.pendingCleanupTimeouts.push(timeoutId);
    }

    this.activeNodes = [];
    this.currentTheme = newTheme;
    this.isRunning = true;

    const newChannelGain = this.ctx.createGain();
    if (this.spatial3DEnabled && this.spatialPannerMain) {
      newChannelGain.connect(this.spatialPannerMain);
    } else {
      newChannelGain.connect(this.masterGain);
    }
    try {
      newChannelGain.gain.setValueAtTime(0.0001, now);
      newChannelGain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);
    } catch {
      newChannelGain.gain.setValueAtTime(1.0, now);
    }
    this.currentChannelGain = newChannelGain;

    switch (newTheme) {
      case 'rainy':
        this.setupRainyCafeSound(newChannelGain);
        break;
      case 'stormy':
        if (this.stormLandscape === 'desert') {
          this.setupStormyDesertSound(newChannelGain);
        } else {
          this.setupStormyForestSound(newChannelGain);
        }
        break;
      case 'focus':
        this.setupFocusSound(newChannelGain);
        break;
      case 'fun':
        this.setupJoyfulGardenSound(newChannelGain);
        break;
      case 'zen':
        this.setupZenGardenSound(newChannelGain);
        break;
      case 'cyberpunk':
        this.setupCyberpunkSound(newChannelGain);
        break;
      case 'space':
        this.setupSpaceSound(newChannelGain);
        break;
      case 'library':
        this.setupLibrarySound(newChannelGain);
        break;
      case 'ocean':
        this.setupOceanSound(newChannelGain);
        break;
      case 'autumn':
        this.setupAutumnSound(newChannelGain);
        break;
      case 'train':
      case 'late_night_train':
        this.setupLateNightTrainSound(newChannelGain);
        break;
      case 'rainforest':
        this.setupRainforestSound(newChannelGain);
        break;
      case 'blizzard':
        this.setupBlizzardSound(newChannelGain);
        break;
      case 'wizard':
        this.setupWizardSound(newChannelGain);
        break;
      case 'desert':
        this.setupDesertSound(newChannelGain);
        break;
      case 'vinyl':
      case 'vintage_vinyl_jazz':
        this.setupVintageVinylJazzSound(newChannelGain);
        break;
      case 'cozy_fireplace':
      case 'cozy_fireplace_lofi':
        this.setupCozyFireplaceSound(newChannelGain);
        break;
      case 'deep_space_observatory':
        this.setupDeepSpaceObservatorySound(newChannelGain);
        break;
      case 'starlit_desert_night':
        this.setupStarlitDesertNightSound(newChannelGain);
        break;
      case 'hogwarts':
        this.setupHogwartsSound(newChannelGain);
        break;
      case 'bamboo':
        this.setupBambooSound(newChannelGain);
        break;
      case 'coding':
        this.setupCodingSound(newChannelGain);
        break;
      case 'greenhouse':
        this.setupGreenhouseSound(newChannelGain);
        break;
      case 'tokyo_snow':
        this.setupTokyoSnowSound(newChannelGain);
        break;
      case 'waterfall':
        this.setupWaterfallSound(newChannelGain);
        break;
      case 'bookstore':
        this.setupBookstoreSound(newChannelGain);
        break;
      case 'aurora':
        this.setupAuroraSound(newChannelGain);
        break;
      case 'starlit_desert':
        this.setupStarlitDesertSound(newChannelGain);
        break;
      case 'midnight_dome':
        this.setupMidnightDomeSound(newChannelGain);
        break;
      case 'paris_balcony':
        this.setupParisBalconySound(newChannelGain);
        break;
      case 'deep_sea':
        this.setupDeepSeaSound(newChannelGain);
        break;
      case 'egyptian_temple':
        this.setupEgyptianTempleSound(newChannelGain);
        break;
      case 'cyberpunk_loft':
        this.setupCyberpunkLoftSound(newChannelGain);
        break;
      case 'whispering_pine':
        this.setupWhisperingPineSound(newChannelGain);
        break;
      case 'victorian_storm':
        this.setupVictorianStormSound(newChannelGain);
        break;
      case 'zen_stone':
        this.setupZenStoneSound(newChannelGain);
        break;
      case 'lunar_base':
        this.setupLunarBaseSound(newChannelGain);
        break;
      default:
        this.setupRainyCafeSound(newChannelGain);
        break;
    }
  }

  public start(theme: ThemeMode = this.currentTheme, initialVolume: number = this.volume, crossFadeDurationSec: number = 2.0) {
    if (this.isRunning && this.currentTheme === theme) {
      this.setVolume(initialVolume);
      return;
    }
    this.crossFadeTo(theme, crossFadeDurationSec, initialVolume);
  }

  // 1. RAINY CAFE HD SOUNDSCAPE
  private setupRainyCafeSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pinkBuf = this.createPinkNoiseBuffer();
    if (pinkBuf) {
      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = pinkBuf;
      rainSource.loop = true;

      const intensityConfig = {
        mist: { lowpass: 1000, highpass: 350, gain: 0.35, dropInterval: 320, dropChance: 0.25 },
        gentle: { lowpass: 1500, highpass: 180, gain: 0.65, dropInterval: 140, dropChance: 0.45 },
        heavy: { lowpass: 2600, highpass: 110, gain: 0.9, dropInterval: 85, dropChance: 0.7 },
        deluge: { lowpass: 3600, highpass: 75, gain: 1.1, dropInterval: 45, dropChance: 0.85 }
      }[this.rainIntensity] || { lowpass: 1500, highpass: 180, gain: 0.65, dropInterval: 140, dropChance: 0.45 };

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(intensityConfig.lowpass, this.ctx.currentTime);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(intensityConfig.highpass, this.ctx.currentTime);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(intensityConfig.gain * this.weatherLayerGain, this.ctx.currentTime);

      rainSource.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(rainGain);
      rainGain.connect(parentGain);
      rainSource.start();
      this.activeNodes.push(rainSource, lowpass, highpass, rainGain);

      const playGlassDroplet = () => {
        if (!this.ctx || !this.isRunning || !this.currentChannelGain) return;
        try {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const filt = this.ctx.createBiquadFilter();
          const now = this.ctx.currentTime;
          const baseFreq = 1400 + Math.random() * 1200;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.04);

          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(baseFreq, now);
          filt.Q.setValueAtTime(6, now);

          g.gain.setValueAtTime(0.04 * this.triggerLayerGain, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

          osc.connect(filt);
          filt.connect(g);
          g.connect(parentGain);
          osc.start(now);
          osc.stop(now + 0.06);
        } catch {}
      };

      const dropInterval = setInterval(() => {
        if (Math.random() < intensityConfig.dropChance) playGlassDroplet();
      }, intensityConfig.dropInterval);
      this.intervals.push(dropInterval);
    }

    const brownBuf = this.createBrownNoiseBuffer();
    if (brownBuf) {
      const cafeSource = this.ctx.createBufferSource();
      cafeSource.buffer = brownBuf;
      cafeSource.loop = true;

      const cafeFilter = this.ctx.createBiquadFilter();
      cafeFilter.type = 'bandpass';
      cafeFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      cafeFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const cafeGain = this.ctx.createGain();
      cafeGain.gain.setValueAtTime(0.35 * this.ambientLayerGain, this.ctx.currentTime);

      cafeSource.connect(cafeFilter);
      cafeFilter.connect(cafeGain);
      cafeGain.connect(parentGain);
      cafeSource.start();
      this.activeNodes.push(cafeSource, cafeFilter, cafeGain);

      const playPorcelainClink = () => {
        if (!this.ctx || !this.isRunning) return;
        try {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const now = this.ctx.currentTime;
          const freq = 2200 + Math.random() * 800;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.02 * this.triggerLayerGain, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

          osc.connect(g);
          g.connect(parentGain);
          osc.start(now);
          osc.stop(now + 0.09);
        } catch {}
      };

      const clinkTimer = setInterval(() => {
        if (Math.random() > 0.5) playPorcelainClink();
      }, 7500);
      this.intervals.push(clinkTimer);
    }
  }

  // 2. STORMY NIGHT (FOREST) HD SOUNDSCAPE
  private setupStormyForestSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pinkBuf = this.createPinkNoiseBuffer();
    if (pinkBuf) {
      const rainSrc = this.ctx.createBufferSource();
      rainSrc.buffer = pinkBuf;
      rainSrc.loop = true;

      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(3100, this.ctx.currentTime);

      const rg = this.ctx.createGain();
      rg.gain.setValueAtTime(1.05 * this.weatherLayerGain, this.ctx.currentTime);

      rainSrc.connect(filt);
      filt.connect(rg);
      rg.connect(parentGain);
      rainSrc.start();
      this.activeNodes.push(rainSrc, filt, rg);
    }

    const windBuf = this.createPinkNoiseBuffer();
    if (windBuf) {
      const windSrc = this.ctx.createBufferSource();
      windSrc.buffer = windBuf;
      windSrc.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.55 * this.ambientLayerGain, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);
      lfo.start();

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(parentGain);
      windSrc.start();
      this.activeNodes.push(windSrc, windFilter, windGain, lfo, lfoGain);
    }

    this.triggerThunder(parentGain);
    const thunderTimer = setInterval(() => {
      this.triggerThunder(parentGain);
    }, 13000);
    this.intervals.push(thunderTimer);
  }

  // 3. STORMY NIGHT (DESERT) HD SOUNDSCAPE
  private setupStormyDesertSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const whiteBuf = this.createWhiteNoiseBuffer();
    if (whiteBuf) {
      const sandSrc = this.ctx.createBufferSource();
      sandSrc.buffer = whiteBuf;
      sandSrc.loop = true;

      const sandFilter = this.ctx.createBiquadFilter();
      sandFilter.type = 'bandpass';
      sandFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      sandFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      const sandGain = this.ctx.createGain();
      sandGain.gain.setValueAtTime(0.5 * this.weatherLayerGain, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(sandFilter.frequency);
      lfo.start();

      sandSrc.connect(sandFilter);
      sandFilter.connect(sandGain);
      sandGain.connect(parentGain);
      sandSrc.start();
      this.activeNodes.push(sandSrc, sandFilter, sandGain, lfo, lfoGain);
    }

    const brownBuf = this.createBrownNoiseBuffer();
    if (brownBuf) {
      const airSrc = this.ctx.createBufferSource();
      airSrc.buffer = brownBuf;
      airSrc.loop = true;

      const airFilt = this.ctx.createBiquadFilter();
      airFilt.type = 'lowpass';
      airFilt.frequency.setValueAtTime(240, this.ctx.currentTime);

      const airGain = this.ctx.createGain();
      airGain.gain.setValueAtTime(0.45 * this.ambientLayerGain, this.ctx.currentTime);

      airSrc.connect(airFilt);
      airFilt.connect(airGain);
      airGain.connect(parentGain);
      airSrc.start();
      this.activeNodes.push(airSrc, airFilt, airGain);
    }

    this.triggerThunder(parentGain);
    const desertThunderTimer = setInterval(() => {
      this.triggerThunder(parentGain);
    }, 15000);
    this.intervals.push(desertThunderTimer);
  }

  public triggerThunder(targetGain?: GainNode) {
    const nowTime = Date.now();
    if (nowTime - this.lastThunderTime < 750) return;
    this.lastThunderTime = nowTime;

    this.thunderListeners.forEach(listener => {
      try { listener(); } catch {}
    });

    if (!this.ctx) return;
    const destGain = targetGain || this.currentChannelGain || this.masterGain;
    if (!destGain) return;

    this.thunderNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
        if ('disconnect' in node && typeof (node as any).disconnect === 'function') (node as any).disconnect();
      } catch {}
    });
    this.thunderNodes = [];

    try {
      const now = this.ctx.currentTime;
      const subGain = this.triggerLayerGain;

      const osc1 = this.ctx.createOscillator();
      const osc1Gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(52, now);
      osc1.frequency.exponentialRampToValueAtTime(24, now + 4.0);

      osc1Gain.gain.setValueAtTime(0.001, now);
      osc1Gain.gain.linearRampToValueAtTime(0.45 * subGain, now + 0.35);
      osc1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      const osc2 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(38, now);
      osc2.frequency.exponentialRampToValueAtTime(18, now + 4.8);

      osc2Gain.gain.setValueAtTime(0.001, now);
      osc2Gain.gain.linearRampToValueAtTime(0.3 * subGain, now + 0.5);
      osc2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);

      this.thunderNodes.push(osc1, osc1Gain, osc2, osc2Gain);

      const brownBuf = this.createBrownNoiseBuffer();
      if (brownBuf) {
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = brownBuf;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(240, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.01, now);
        noiseGain.gain.linearRampToValueAtTime(0.35 * subGain, now + 0.25);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(destGain);
        noiseSource.start(now);
        noiseSource.stop(now + 3.9);
        this.thunderNodes.push(noiseSource, noiseFilter, noiseGain);
      }

      osc1.connect(osc1Gain);
      osc1Gain.connect(destGain);
      osc1.start(now);
      osc1.stop(now + 4.6);

      osc2.connect(osc2Gain);
      osc2Gain.connect(destGain);
      osc2.start(now);
      osc2.stop(now + 5.3);
    } catch {}
  }

  // 4. JOYFUL GARDEN SOUNDSCAPE
  private setupJoyfulGardenSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (!pink) return;

    const breezeSrc = this.ctx.createBufferSource();
    breezeSrc.buffer = pink;
    breezeSrc.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    breezeFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.setValueAtTime(0.3 * this.ambientLayerGain, this.ctx.currentTime);

    breezeSrc.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(parentGain);
    breezeSrc.start();
    this.activeNodes.push(breezeSrc, breezeFilter, breezeGain);

    const notes = [261.63, 329.63, 392.00, 440.00, 523.25, 659.25];
    const playChimeNote = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const noteFreq = notes[Math.floor(Math.random() * notes.length)];

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.07 * this.triggerLayerGain, now + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(noteGain);
        noteGain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 2.1);
      } catch {}
    };

    const chimeTimer = setInterval(playChimeNote, 2800);
    this.intervals.push(chimeTimer);

    const playBirdChirp = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const chirpOsc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();

        chirpOsc.type = 'sine';
        const startFreq = 2600 + Math.random() * 1000;
        chirpOsc.frequency.setValueAtTime(startFreq, now);
        chirpOsc.frequency.exponentialRampToValueAtTime(startFreq + 1100, now + 0.07);
        chirpOsc.frequency.exponentialRampToValueAtTime(startFreq - 500, now + 0.15);

        chirpGain.gain.setValueAtTime(0.001, now);
        chirpGain.gain.linearRampToValueAtTime(0.04 * this.triggerLayerGain, now + 0.03);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(parentGain);
        chirpOsc.start(now);
        chirpOsc.stop(now + 0.22);
      } catch {}
    };

    const birdTimer = setInterval(() => {
      if (Math.random() > 0.3) playBirdChirp();
    }, 3500);
    this.intervals.push(birdTimer);
  }

  // 5. FOCUS SOUNDSCAPE (Brown noise + 10Hz alpha binaural beat + 432Hz Tibetan Singing Bowl)
  private setupFocusSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const brownBuffer = this.createBrownNoiseBuffer();
    if (!brownBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = brownBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65 * this.ambientLayerGain, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(parentGain);
    source.start();

    const osc1 = this.ctx.createOscillator();
    const osc1Gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, this.ctx.currentTime);
    osc1Gain.gain.setValueAtTime(0.05 * this.weatherLayerGain, this.ctx.currentTime);

    osc1.connect(osc1Gain);
    osc1Gain.connect(parentGain);
    osc1.start();

    const osc2 = this.ctx.createOscillator();
    const osc2Gain = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(226, this.ctx.currentTime); // 10Hz alpha beat
    osc2Gain.gain.setValueAtTime(0.04 * this.weatherLayerGain, this.ctx.currentTime);

    osc2.connect(osc2Gain);
    osc2Gain.connect(parentGain);
    osc2.start();

    const playZenBowl = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const bowlOsc = this.ctx.createOscillator();
        const bowlGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        bowlOsc.type = 'sine';
        bowlOsc.frequency.setValueAtTime(432, now);

        bowlGain.gain.setValueAtTime(0.0001, now);
        bowlGain.gain.linearRampToValueAtTime(0.08 * this.triggerLayerGain, now + 0.1);
        bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        bowlOsc.connect(bowlGain);
        bowlGain.connect(parentGain);
        bowlOsc.start(now);
        bowlOsc.stop(now + 5.6);
      } catch {}
    };

    playZenBowl();
    const bowlInterval = setInterval(playZenBowl, 16000);
    this.intervals.push(bowlInterval);

    this.activeNodes.push(source, filter, noiseGain, osc1, osc1Gain, osc2, osc2Gain);
  }

  // 6. ZEN GARDEN SOUNDSCAPE
  private setupZenGardenSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (!pink) return;

    const breezeSrc = this.ctx.createBufferSource();
    breezeSrc.buffer = pink;
    breezeSrc.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(520, this.ctx.currentTime);
    breezeFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.setValueAtTime(0.35 * this.ambientLayerGain, this.ctx.currentTime);

    breezeSrc.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(parentGain);
    breezeSrc.start();
    this.activeNodes.push(breezeSrc, breezeFilter, breezeGain);

    const playShishiOdoshi = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(1200, now);
        dropOsc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        dropGain.gain.setValueAtTime(0.001, now);
        dropGain.gain.linearRampToValueAtTime(0.05 * this.triggerLayerGain, now + 0.01);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        dropOsc.connect(dropGain);
        dropGain.connect(parentGain);
        dropOsc.start(now);
        dropOsc.stop(now + 0.16);

        const clackTime = now + 0.35;
        const clackOsc = this.ctx.createOscillator();
        const clackGain = this.ctx.createGain();
        clackOsc.type = 'triangle';
        clackOsc.frequency.setValueAtTime(240, clackTime);
        clackOsc.frequency.exponentialRampToValueAtTime(85, clackTime + 0.08);
        clackGain.gain.setValueAtTime(0.001, clackTime);
        clackGain.gain.linearRampToValueAtTime(0.12 * this.triggerLayerGain, clackTime + 0.01);
        clackGain.gain.exponentialRampToValueAtTime(0.0001, clackTime + 0.1);
        clackOsc.connect(clackGain);
        clackGain.connect(parentGain);
        clackOsc.start(clackTime);
        clackOsc.stop(clackTime + 0.12);
      } catch {}
    };

    const fountainTimer = setInterval(playShishiOdoshi, 6000);
    this.intervals.push(fountainTimer);

    const zenNotes = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33];
    const playZenChime = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const noteFreq = zenNotes[Math.floor(Math.random() * zenNotes.length)];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.08 * this.triggerLayerGain, now + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(noteGain);
        noteGain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 3.3);
      } catch {}
    };

    const chimeTimer = setInterval(playZenChime, 2400);
    this.intervals.push(chimeTimer);
  }

  // 7. CYBERPUNK SOUNDSCAPE
  private setupCyberpunkSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const droneSrc = this.ctx.createBufferSource();
      droneSrc.buffer = pink;
      droneSrc.loop = true;

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.4 * this.weatherLayerGain, this.ctx.currentTime);

      droneSrc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(parentGain);
      droneSrc.start();
      this.activeNodes.push(droneSrc, droneFilter, droneGain);
    }

    const neonNotes = [130.81, 196.00, 233.08, 293.66, 349.23];
    const playCyberNeonSynth = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const synthGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const noteFreq = neonNotes[Math.floor(Math.random() * neonNotes.length)];

        osc.type = Math.random() > 0.5 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(2.0, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 1.8);

        synthGain.gain.setValueAtTime(0.001, now);
        synthGain.gain.linearRampToValueAtTime(0.05 * this.ambientLayerGain, now + 0.1);
        synthGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(filter);
        filter.connect(synthGain);
        synthGain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 2.1);
      } catch {}
    };

    const cyberTimer = setInterval(playCyberNeonSynth, 3200);
    this.intervals.push(cyberTimer);
  }

  // 8. SPACE OBSERVATORY SOUNDSCAPE
  private setupSpaceSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const brown = this.createBrownNoiseBuffer();
    if (brown) {
      const humSrc = this.ctx.createBufferSource();
      humSrc.buffer = brown;
      humSrc.loop = true;

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(90, this.ctx.currentTime);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.55 * this.ambientLayerGain, this.ctx.currentTime);

      humSrc.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(parentGain);
      humSrc.start();
      this.activeNodes.push(humSrc, humFilter, humGain);
    }

    const droneOsc1 = this.ctx.createOscillator();
    const droneOsc2 = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();

    droneOsc1.type = 'sine';
    droneOsc1.frequency.setValueAtTime(73.42, this.ctx.currentTime);
    droneOsc2.type = 'sine';
    droneOsc2.frequency.setValueAtTime(147.23, this.ctx.currentTime);

    droneGain.gain.setValueAtTime(0.12 * this.ambientLayerGain, this.ctx.currentTime);

    droneOsc1.connect(droneGain);
    droneOsc2.connect(droneGain);
    droneGain.connect(parentGain);

    droneOsc1.start();
    droneOsc2.start();
    this.activeNodes.push(droneOsc1, droneOsc2, droneGain);

    const spaceChimes = [1200, 1500, 1800, 2200, 2700, 3200];
    const playSpaceTwinkle = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const sparkleGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const noteFreq = spaceChimes[Math.floor(Math.random() * spaceChimes.length)];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        sparkleGain.gain.setValueAtTime(0.001, now);
        sparkleGain.gain.linearRampToValueAtTime(0.03 * this.triggerLayerGain, now + 0.1);
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(sparkleGain);
        sparkleGain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 4.6);
      } catch {}
    };

    const spaceTimer = setInterval(playSpaceTwinkle, 4500);
    this.intervals.push(spaceTimer);
  }

  // 9. LIBRARY SOUNDSCAPE
  private setupLibrarySound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const roomSrc = this.ctx.createBufferSource();
      roomSrc.buffer = pink;
      roomSrc.loop = true;

      const roomFilter = this.ctx.createBiquadFilter();
      roomFilter.type = 'bandpass';
      roomFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
      roomFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      const roomGain = this.ctx.createGain();
      roomGain.gain.setValueAtTime(0.25 * this.ambientLayerGain, this.ctx.currentTime);

      roomSrc.connect(roomFilter);
      roomFilter.connect(roomGain);
      roomGain.connect(parentGain);
      roomSrc.start();
      this.activeNodes.push(roomSrc, roomFilter, roomGain);
    }

    const playFireCrackle = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(Math.random() * 5000 + 4000, now);

        crackleGain.gain.setValueAtTime(0.001, now);
        crackleGain.gain.linearRampToValueAtTime(0.18 * this.weatherLayerGain, now + 0.001);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

        osc.connect(crackleGain);
        crackleGain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.02);
      } catch {}
    };

    const crackleInterval = setInterval(() => {
      const bursts = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < bursts; i++) {
        setTimeout(playFireCrackle, Math.random() * 200);
      }
    }, 280);
    this.intervals.push(crackleInterval);
  }

  // 10. OCEAN WAVES SOUNDSCAPE
  private setupOceanSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const swellSrc = this.ctx.createBufferSource();
      swellSrc.buffer = pink;
      swellSrc.loop = true;

      const swellFilter = this.ctx.createBiquadFilter();
      swellFilter.type = 'lowpass';
      swellFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(0.02 * this.ambientLayerGain, this.ctx.currentTime);

      swellSrc.connect(swellFilter);
      swellFilter.connect(swellGain);
      swellGain.connect(parentGain);
      swellSrc.start();
      this.activeNodes.push(swellSrc, swellFilter, swellGain);

      let time = 0;
      const lfoInterval = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        time += 0.1;
        const waveProgress = Math.sin(time * 0.4);
        const currentGain = (0.3 + waveProgress * 0.25) * this.ambientLayerGain;
        const currentFreq = 360 + waveProgress * 240;

        try {
          swellGain.gain.linearRampToValueAtTime(currentGain, this.ctx.currentTime + 0.1);
          swellFilter.frequency.linearRampToValueAtTime(currentFreq, this.ctx.currentTime + 0.1);
        } catch {}
      }, 100);
      this.intervals.push(lfoInterval);
    }
  }

  // 11. AUTUMN SOUNDSCAPE
  private setupAutumnSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const windSrc = this.ctx.createBufferSource();
      windSrc.buffer = pink;
      windSrc.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(620, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.28 * this.ambientLayerGain, this.ctx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(parentGain);
      windSrc.start();
      this.activeNodes.push(windSrc, windFilter, windGain);
    }

    const jazzChords = [
      [130.81, 164.81, 196.00, 246.94],
      [146.83, 174.61, 220.00, 261.63],
      [174.61, 220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66, 349.23],
    ];

    const playJazzGuitarChords = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const chord = jazzChords[Math.floor(Math.random() * jazzChords.length)];
        const now = this.ctx.currentTime;

        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const noteGain = this.ctx!.createGain();
          const pluckTime = now + idx * 0.06;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, pluckTime);

          noteGain.gain.setValueAtTime(0, pluckTime);
          noteGain.gain.linearRampToValueAtTime(0.04 * this.triggerLayerGain, pluckTime + 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, pluckTime + 4.0);

          osc.connect(noteGain);
          noteGain.connect(parentGain);
          osc.start(pluckTime);
          osc.stop(pluckTime + 4.1);
        });
      } catch {}
    };

    const jazzTimer = setInterval(playJazzGuitarChords, 6500);
    this.intervals.push(jazzTimer);
  }

  // 12. TRAIN SOUNDSCAPE
  private setupTrainSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const brown = this.createBrownNoiseBuffer();
    if (brown) {
      const humSrc = this.ctx.createBufferSource();
      humSrc.buffer = brown;
      humSrc.loop = true;

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(100, this.ctx.currentTime);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.5 * this.ambientLayerGain, this.ctx.currentTime);

      humSrc.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(parentGain);
      humSrc.start();
      this.activeNodes.push(humSrc, humFilter, humGain);
    }

    const playTrainTrackClack = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        [0, 0.16].forEach((delay) => {
          const osc = this.ctx!.createOscillator();
          const clackGain = this.ctx!.createGain();
          const playTime = now + delay;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(55, playTime);
          osc.frequency.exponentialRampToValueAtTime(15, playTime + 0.12);

          clackGain.gain.setValueAtTime(0, playTime);
          clackGain.gain.linearRampToValueAtTime(0.24 * this.triggerLayerGain, playTime + 0.01);
          clackGain.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.14);

          osc.connect(clackGain);
          clackGain.connect(parentGain);
          osc.start(playTime);
          osc.stop(playTime + 0.15);
        });
      } catch {}
    };

    const clackTimer = setInterval(playTrainTrackClack, 1800);
    this.intervals.push(clackTimer);
  }

  // 13. RAINFOREST SOUNDSCAPE
  private setupRainforestSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const rainSrc = this.ctx.createBufferSource();
      rainSrc.buffer = pink;
      rainSrc.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.38 * this.weatherLayerGain, this.ctx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(parentGain);
      rainSrc.start();
      this.activeNodes.push(rainSrc, rainFilter, rainGain);
    }

    const playRainforestWildlife = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [880.00, 987.77, 1174.66, 1318.51, 1567.98];
        const baseFreq = notes[Math.floor(Math.random() * notes.length)];

        for (let i = 0; i < 5; i++) {
          const osc = this.ctx.createOscillator();
          const trillGain = this.ctx.createGain();
          const startTime = now + i * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq + (i * 30), startTime);

          trillGain.gain.setValueAtTime(0, startTime);
          trillGain.gain.linearRampToValueAtTime(0.015 * this.triggerLayerGain, startTime + 0.02);
          trillGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

          osc.connect(trillGain);
          trillGain.connect(parentGain);
          osc.start(startTime);
          osc.stop(startTime + 0.14);
        }
      } catch {}
    };

    const wildTimer = setInterval(() => {
      if (Math.random() > 0.3) playRainforestWildlife();
    }, 3800);
    this.intervals.push(wildTimer);
  }

  // 14. BLIZZARD SOUNDSCAPE
  private setupBlizzardSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const white = this.createWhiteNoiseBuffer();
    if (white) {
      const windSrc = this.ctx.createBufferSource();
      windSrc.buffer = white;
      windSrc.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.22 * this.weatherLayerGain, this.ctx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(parentGain);
      windSrc.start();
      this.activeNodes.push(windSrc, windFilter, windGain);

      const windGustLfo = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        const now = this.ctx.currentTime;
        try {
          const targetFreq = 300 + Math.random() * 550;
          const targetQ = 1.8 + Math.random() * 3.5;
          const targetGain = (0.12 + Math.random() * 0.22) * this.weatherLayerGain;

          windFilter.frequency.linearRampToValueAtTime(targetFreq, now + 1.5);
          windFilter.Q.linearRampToValueAtTime(targetQ, now + 1.5);
          windGain.gain.linearRampToValueAtTime(targetGain, now + 1.5);
        } catch {}
      }, 1600);
      this.intervals.push(windGustLfo);
    }
  }

  // 15. WIZARD SOUNDSCAPE
  private setupWizardSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const droneFilter = this.ctx.createBiquadFilter();
    const droneGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110.00, this.ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(165.40, this.ctx.currentTime);

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

    droneGain.gain.setValueAtTime(0.08 * this.ambientLayerGain, this.ctx.currentTime);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(parentGain);

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, droneFilter, droneGain);

    const spellChimes = [1567.98, 1760.00, 1975.53, 2349.32, 2637.02, 3135.96];
    const playSpellSparkle = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const spellGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const noteFreq = spellChimes[Math.floor(Math.random() * spellChimes.length)];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        spellGain.gain.setValueAtTime(0.001, now);
        spellGain.gain.linearRampToValueAtTime(0.02 * this.triggerLayerGain, now + 0.08);
        spellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(spellGain);
        spellGain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 4.0);
      } catch {}
    };

    const spellTimer = setInterval(playSpellSparkle, 4000);
    this.intervals.push(spellTimer);
  }

  // 16. DESERT SOUNDSCAPE (Warm winds + gentle acoustic ambient sitar/oud tones)
  private setupDesertSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(420, this.ctx.currentTime);
      filt.Q.setValueAtTime(2.5, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const desertNotes = [146.83, 164.81, 196.00, 220.00, 246.94]; // D Dorian notes
    const playDesertPluck = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = desertNotes[Math.floor(Math.random() * desertNotes.length)];
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.04 * this.triggerLayerGain, now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
        osc.connect(g);
        g.connect(parentGain);
        osc.start(now);
        osc.stop(now + 3.6);
      } catch {}
    };
    const pluckTimer = setInterval(playDesertPluck, 5500);
    this.intervals.push(pluckTimer);
  }

  // 17. VINYL SOUNDSCAPE (Record surface crackles + warm Rhodes chords)
  private setupVinylSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const white = this.createWhiteNoiseBuffer();
    if (white) {
      const src = this.ctx.createBufferSource();
      src.buffer = white;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(3200, this.ctx.currentTime);
      filt.Q.setValueAtTime(3.0, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const playVinylPop = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(Math.random() * 4000 + 2000, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.12 * this.triggerLayerGain, now + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.connect(g);
        g.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.025);
      } catch {}
    };
    const popTimer = setInterval(() => {
      if (Math.random() > 0.4) playVinylPop();
    }, 180);
    this.intervals.push(popTimer);
  }

  // 18. HOGWARTS SOUNDSCAPE (Gothic cathedral drone + enchanted bells)
  private setupHogwartsSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filt = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65.41, this.ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(98.00, this.ctx.currentTime);
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(280, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15 * this.ambientLayerGain, this.ctx.currentTime);
    osc1.connect(filt);
    osc2.connect(filt);
    filt.connect(gain);
    gain.connect(parentGain);
    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, filt, gain);

    const bellNotes = [587.33, 659.25, 783.99, 880.00, 1046.50];
    const playHogwartsChime = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const bell = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = bellNotes[Math.floor(Math.random() * bellNotes.length)];
        bell.type = 'sine';
        bell.frequency.setValueAtTime(freq, now);
        bg.gain.setValueAtTime(0.001, now);
        bg.gain.linearRampToValueAtTime(0.03 * this.triggerLayerGain, now + 0.05);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
        bell.connect(bg);
        bg.connect(parentGain);
        bell.start(now);
        bell.stop(now + 4.3);
      } catch {}
    };
    const bellTimer = setInterval(playHogwartsChime, 4800);
    this.intervals.push(bellTimer);
  }

  // 19. BAMBOO SOUNDSCAPE (Bamboo forest rustle + shakuhachi breath)
  private setupBambooSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(800, this.ctx.currentTime);
      filt.Q.setValueAtTime(1.8, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const fluteNotes = [440.00, 493.88, 554.37, 659.25, 739.99];
    const playFlute = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const fg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = fluteNotes[Math.floor(Math.random() * fluteNotes.length)];
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        fg.gain.setValueAtTime(0.001, now);
        fg.gain.linearRampToValueAtTime(0.03 * this.triggerLayerGain, now + 0.4);
        fg.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
        osc.connect(fg);
        fg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 3.1);
      } catch {}
    };
    const fluteTimer = setInterval(playFlute, 6000);
    this.intervals.push(fluteTimer);
  }

  // 20. CODING LAB SOUNDSCAPE (Server fans + mechanical keyboard key taps)
  private setupCodingSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const brown = this.createBrownNoiseBuffer();
    if (brown) {
      const src = this.ctx.createBufferSource();
      src.buffer = brown;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(95, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const playKeyClick = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const kg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800 + Math.random() * 800, now);
        kg.gain.setValueAtTime(0.001, now);
        kg.gain.linearRampToValueAtTime(0.06 * this.triggerLayerGain, now + 0.005);
        kg.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(kg);
        kg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch {}
    };
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        playKeyClick();
        if (Math.random() > 0.5) setTimeout(playKeyClick, 120);
      }
    }, 450);
    this.intervals.push(typingInterval);
  }

  // 21. GREENHOUSE SOUNDSCAPE (Glasshouse humidity mist + gentle drips)
  private setupGreenhouseSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(950, this.ctx.currentTime);
      filt.Q.setValueAtTime(1.2, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const playLeafDrip = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const dg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        dg.gain.setValueAtTime(0.001, now);
        dg.gain.linearRampToValueAtTime(0.04 * this.triggerLayerGain, now + 0.01);
        dg.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.connect(dg);
        dg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch {}
    };
    const dripTimer = setInterval(playLeafDrip, 3200);
    this.intervals.push(dripTimer);
  }

  // 22. TOKYO SNOW SOUNDSCAPE (Muffled snow calm + glass wind chimes)
  private setupTokyoSnowSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(260, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const chimeFrequencies = [2093.00, 2349.32, 2793.83, 3135.96];
    const playGlassChime = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const cg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = chimeFrequencies[Math.floor(Math.random() * chimeFrequencies.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        cg.gain.setValueAtTime(0.001, now);
        cg.gain.linearRampToValueAtTime(0.02 * this.triggerLayerGain, now + 0.02);
        cg.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
        osc.connect(cg);
        cg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 2.9);
      } catch {}
    };
    const chimeTimer = setInterval(playGlassChime, 3600);
    this.intervals.push(chimeTimer);
  }

  // 23. WATERFALL SOUNDSCAPE (Cascading water roar + mist spray)
  private setupWaterfallSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src1 = this.ctx.createBufferSource();
      src1.buffer = pink;
      src1.loop = true;
      const filt1 = this.ctx.createBiquadFilter();
      filt1.type = 'lowpass';
      filt1.frequency.setValueAtTime(650, this.ctx.currentTime);
      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(0.55 * this.weatherLayerGain, this.ctx.currentTime);
      src1.connect(filt1);
      filt1.connect(gain1);
      gain1.connect(parentGain);
      src1.start();

      const src2 = this.ctx.createBufferSource();
      src2.buffer = pink;
      src2.loop = true;
      const filt2 = this.ctx.createBiquadFilter();
      filt2.type = 'bandpass';
      filt2.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filt2.Q.setValueAtTime(0.8, this.ctx.currentTime);
      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.35 * this.weatherLayerGain, this.ctx.currentTime);
      src2.connect(filt2);
      filt2.connect(gain2);
      gain2.connect(parentGain);
      src2.start();

      this.activeNodes.push(src1, filt1, gain1, src2, filt2, gain2);
    }
  }

  // 24. BOOKSTORE SOUNDSCAPE (Old paper page turns + clock ticking)
  private setupBookstoreSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const brown = this.createBrownNoiseBuffer();
    if (brown) {
      const src = this.ctx.createBufferSource();
      src.buffer = brown;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(180, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const playClockTick = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const tg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        tg.gain.setValueAtTime(0.001, now);
        tg.gain.linearRampToValueAtTime(0.02 * this.triggerLayerGain, now + 0.005);
        tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(tg);
        tg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch {}
    };
    const clockTimer = setInterval(playClockTick, 1000);
    this.intervals.push(clockTimer);
  }

  // 25. AURORA SOUNDSCAPE (Harmonic crystal pads + ethereal sweeping shimmer)
  private setupAuroraSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(174.61, this.ctx.currentTime);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(349.23, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.18 * this.ambientLayerGain, this.ctx.currentTime);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(parentGain);
    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, gain);

    const auroraChimes = [1396.91, 1760.00, 2093.00, 2793.83];
    const playShimmer = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const sg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = auroraChimes[Math.floor(Math.random() * auroraChimes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        sg.gain.setValueAtTime(0.001, now);
        sg.gain.linearRampToValueAtTime(0.02 * this.triggerLayerGain, now + 0.1);
        sg.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
        osc.connect(sg);
        sg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 3.9);
      } catch {}
    };
    const shimmerTimer = setInterval(playShimmer, 4200);
    this.intervals.push(shimmerTimer);
  }

  // 26. STARLIT DESERT SOUNDSCAPE (Night breeze + soft crickets)
  private setupStarlitDesertSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(300, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.ambientLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const playCricket = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator();
          const cg = this.ctx.createGain();
          const t = now + i * 0.06;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4500, t);
          cg.gain.setValueAtTime(0.001, t);
          cg.gain.linearRampToValueAtTime(0.012 * this.triggerLayerGain, t + 0.01);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
          osc.connect(cg);
          cg.connect(parentGain);
          osc.start(t);
          osc.stop(t + 0.05);
        }
      } catch {}
    };
    const cricketTimer = setInterval(playCricket, 2200);
    this.intervals.push(cricketTimer);
  }

  // 27. MIDNIGHT DOME SOUNDSCAPE (Planetarium telescope hum + celestial bells)
  private setupMidnightDomeSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filt = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65.4, this.ctx.currentTime);
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(140, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.25 * this.ambientLayerGain, this.ctx.currentTime);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(parentGain);
    osc.start();
    this.activeNodes.push(osc, filt, gain);

    const domeNotes = [523.25, 659.25, 783.99, 1046.50];
    const playDomeBell = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const bell = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = domeNotes[Math.floor(Math.random() * domeNotes.length)];
        bell.type = 'sine';
        bell.frequency.setValueAtTime(freq, now);
        bg.gain.setValueAtTime(0.001, now);
        bg.gain.linearRampToValueAtTime(0.03 * this.triggerLayerGain, now + 0.08);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);
        bell.connect(bg);
        bg.connect(parentGain);
        bell.start(now);
        bell.stop(now + 4.1);
      } catch {}
    };
    const bellTimer = setInterval(playDomeBell, 5000);
    this.intervals.push(bellTimer);
  }

  // 28. PARIS BALCONY SOUNDSCAPE (Gentle rain + café accordion motif)
  private setupParisBalconySound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(1100, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4 * this.weatherLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const accordionChords = [
      [220.00, 261.63, 329.63], // Am
      [196.00, 246.94, 293.66], // G
      [174.61, 220.00, 261.63], // F
      [164.81, 207.65, 246.94]  // E
    ];
    const playAccordion = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const chord = accordionChords[Math.floor(Math.random() * accordionChords.length)];
        const now = this.ctx.currentTime;
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const ag = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          ag.gain.setValueAtTime(0.001, now);
          ag.gain.linearRampToValueAtTime(0.015 * this.triggerLayerGain, now + 0.3);
          ag.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
          osc.connect(ag);
          ag.connect(parentGain);
          osc.start(now);
          osc.stop(now + 3.3);
        });
      } catch {}
    };
    const accordionTimer = setInterval(playAccordion, 6500);
    this.intervals.push(accordionTimer);
  }

  // 29. DEEP SEA SOUNDSCAPE (Submarine pressure hum + sonar pings + whale songs)
  private setupDeepSeaSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(42, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.4 * this.ambientLayerGain, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(parentGain);
    osc.start();
    this.activeNodes.push(osc, gain);

    const playSonarPing = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const ping = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        ping.type = 'sine';
        ping.frequency.setValueAtTime(850, now);
        pg.gain.setValueAtTime(0.001, now);
        pg.gain.linearRampToValueAtTime(0.04 * this.triggerLayerGain, now + 0.02);
        pg.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        ping.connect(pg);
        pg.connect(parentGain);
        ping.start(now);
        ping.stop(now + 2.6);
      } catch {}
    };
    const sonarTimer = setInterval(playSonarPing, 7000);
    this.intervals.push(sonarTimer);
  }

  // 30. EGYPTIAN TEMPLE SOUNDSCAPE (Hypnotic drone + golden sacred bells)
  private setupEgyptianTempleSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220.00, this.ctx.currentTime); // A3
    gain.gain.setValueAtTime(0.12 * this.ambientLayerGain, this.ctx.currentTime);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(parentGain);
    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, gain);

    const playTempleGong = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const gong = this.ctx.createOscillator();
        const gg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        gong.type = 'sine';
        gong.frequency.setValueAtTime(293.66, now);
        gg.gain.setValueAtTime(0.001, now);
        gg.gain.linearRampToValueAtTime(0.06 * this.triggerLayerGain, now + 0.05);
        gg.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
        gong.connect(gg);
        gg.connect(parentGain);
        gong.start(now);
        gong.stop(now + 4.6);
      } catch {}
    };
    const gongTimer = setInterval(playTempleGong, 8000);
    this.intervals.push(gongTimer);
  }

  // 31. CYBERPUNK LOFT SOUNDSCAPE (Neon glass rain + synthwave bassline)
  private setupCyberpunkLoftSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const src = this.ctx.createBufferSource();
      src.buffer = pink;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(500, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.weatherLayerGain, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      src.start();
      this.activeNodes.push(src, filt, gain);
    }

    const bassline = [65.41, 73.42, 82.41, 98.00];
    let noteIndex = 0;
    const playBassNote = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = bassline[noteIndex % bassline.length];
        noteIndex++;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        bg.gain.setValueAtTime(0.001, now);
        bg.gain.linearRampToValueAtTime(0.04 * this.ambientLayerGain, now + 0.05);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc.connect(bg);
        bg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.85);
      } catch {}
    };
    const bassTimer = setInterval(playBassNote, 900);
    this.intervals.push(bassTimer);
  }

  // 32. WHISPERING PINE SOUNDSCAPE (Mountain stream + pine wind + owl)
  private setupWhisperingPineSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const streamSrc = this.ctx.createBufferSource();
      streamSrc.buffer = pink;
      streamSrc.loop = true;
      const streamFilt = this.ctx.createBiquadFilter();
      streamFilt.type = 'bandpass';
      streamFilt.frequency.setValueAtTime(750, this.ctx.currentTime);
      streamFilt.Q.setValueAtTime(1.5, this.ctx.currentTime);
      const streamGain = this.ctx.createGain();
      streamGain.gain.setValueAtTime(0.38 * this.ambientLayerGain, this.ctx.currentTime);
      streamSrc.connect(streamFilt);
      streamFilt.connect(streamGain);
      streamGain.connect(parentGain);
      streamSrc.start();
      this.activeNodes.push(streamSrc, streamFilt, streamGain);
    }

    const playOwlHoot = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(270, now + 0.4);
        og.gain.setValueAtTime(0.001, now);
        og.gain.linearRampToValueAtTime(0.02 * this.triggerLayerGain, now + 0.08);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(og);
        og.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.55);
      } catch {}
    };
    const owlTimer = setInterval(playOwlHoot, 9500);
    this.intervals.push(owlTimer);
  }

  // 33. VICTORIAN STORM SOUNDSCAPE (Grand arched window rain + grandfather clock)
  private setupVictorianStormSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const pink = this.createPinkNoiseBuffer();
    if (pink) {
      const rainSrc = this.ctx.createBufferSource();
      rainSrc.buffer = pink;
      rainSrc.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(1800, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45 * this.weatherLayerGain, this.ctx.currentTime);
      rainSrc.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      rainSrc.start();
      this.activeNodes.push(rainSrc, filt, gain);
    }

    let isTick = true;
    const playVictorianClock = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const cg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isTick ? 750 : 600, now);
        isTick = !isTick;
        cg.gain.setValueAtTime(0.001, now);
        cg.gain.linearRampToValueAtTime(0.03 * this.triggerLayerGain, now + 0.005);
        cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.connect(cg);
        cg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch {}
    };
    const clockTimer = setInterval(playVictorianClock, 1000);
    this.intervals.push(clockTimer);
  }

  // 34. ZEN STONE SOUNDSCAPE (Deep singing bowl + dripping cavern pool)
  private setupZenStoneSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(108.00, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2 * this.ambientLayerGain, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(parentGain);
    osc.start();
    this.activeNodes.push(osc, gain);

    const playCaveDrop = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const drop = this.ctx.createOscillator();
        const dg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        drop.type = 'sine';
        drop.frequency.setValueAtTime(1400, now);
        drop.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        dg.gain.setValueAtTime(0.001, now);
        dg.gain.linearRampToValueAtTime(0.05 * this.triggerLayerGain, now + 0.01);
        dg.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        drop.connect(dg);
        dg.connect(parentGain);
        drop.start(now);
        drop.stop(now + 0.38);
      } catch {}
    };
    const dropTimer = setInterval(playCaveDrop, 4500);
    this.intervals.push(dropTimer);
  }

  // 35. LUNAR BASE SOUNDSCAPE (Life support hum + zero-g telemetry beeps)
  private setupLunarBaseSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;
    const brown = this.createBrownNoiseBuffer();
    if (brown) {
      const humSrc = this.ctx.createBufferSource();
      humSrc.buffer = brown;
      humSrc.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(80, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45 * this.ambientLayerGain, this.ctx.currentTime);
      humSrc.connect(filt);
      filt.connect(gain);
      gain.connect(parentGain);
      humSrc.start();
      this.activeNodes.push(humSrc, filt, gain);
    }

    const telemetryNotes = [1760.00, 2200.00, 2640.00];
    const playTelemetry = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const tg = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const freq = telemetryNotes[Math.floor(Math.random() * telemetryNotes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        tg.gain.setValueAtTime(0.001, now);
        tg.gain.linearRampToValueAtTime(0.015 * this.triggerLayerGain, now + 0.01);
        tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(tg);
        tg.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.14);
      } catch {}
    };
    const teleTimer = setInterval(playTelemetry, 3800);
    this.intervals.push(teleTimer);
  }

  // 36. LATE NIGHT TRAIN JOURNEY (Rhythmic iron clatter, carriage rumble, distant whistle & rain on glass)
  private setupLateNightTrainSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const brown = this.createBrownNoiseBuffer();
    const pink = this.createPinkNoiseBuffer();
    if (!brown || !pink) return;

    // 1. Carriage floor rumble (low frequency continuous iron resonance)
    const rumbleSrc = this.ctx.createBufferSource();
    rumbleSrc.buffer = brown;
    rumbleSrc.loop = true;
    const rumbleFilt = this.ctx.createBiquadFilter();
    rumbleFilt.type = 'lowpass';
    rumbleFilt.frequency.setValueAtTime(95, this.ctx.currentTime);
    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.42 * this.ambientLayerGain, this.ctx.currentTime);
    rumbleSrc.connect(rumbleFilt);
    rumbleFilt.connect(rumbleGain);
    rumbleGain.connect(parentGain);
    rumbleSrc.start();
    this.activeNodes.push(rumbleSrc, rumbleFilt, rumbleGain);

    // 2. Window rain patter (gentle night precipitation against carriage window glass)
    const rainSrc = this.ctx.createBufferSource();
    rainSrc.buffer = pink;
    rainSrc.loop = true;
    const rainFilt = this.ctx.createBiquadFilter();
    rainFilt.type = 'highpass';
    rainFilt.frequency.setValueAtTime(2400, this.ctx.currentTime);
    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.12 * this.weatherLayerGain, this.ctx.currentTime);
    rainSrc.connect(rainFilt);
    rainFilt.connect(rainGain);
    rainGain.connect(parentGain);
    rainSrc.start();
    this.activeNodes.push(rainSrc, rainFilt, rainGain);

    // 3. Rhythmic "ka-thump... ka-thump" steel joint rail clack sequence
    const playRailClack = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const offsets = [0, 0.16, 0.52, 0.68]; // Quad rhythm pattern of passenger train bogies
        offsets.forEach((offset, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const filt = this.ctx!.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          const freq = idx % 2 === 0 ? 110 + Math.random() * 10 : 85 + Math.random() * 8;
          osc.frequency.setValueAtTime(freq, now + offset);
          osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.12);

          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(320, now + offset);
          filt.Q.setValueAtTime(3.0, now + offset);

          gain.gain.setValueAtTime(0.001, now + offset);
          gain.gain.linearRampToValueAtTime((idx % 2 === 0 ? 0.22 : 0.15) * this.triggerLayerGain, now + offset + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);

          osc.connect(filt);
          filt.connect(gain);
          gain.connect(parentGain);
          osc.start(now + offset);
          osc.stop(now + offset + 0.16);
        });
      } catch {}
    };

    playRailClack();
    const clackInterval = setInterval(playRailClack, 1400); // Rhythmic steady 85 BPM train cadence
    this.intervals.push(clackInterval);

    // 4. Distant nostalgic night train whistle
    const playDistantWhistle = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        // Minor third chord (D5 + F5) distant train horn
        const freqs = [587.33, 698.46];
        freqs.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 0.98, now + 3.0);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.018 * this.triggerLayerGain, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

          osc.connect(gain);
          gain.connect(parentGain);
          osc.start(now);
          osc.stop(now + 3.5);
        });
      } catch {}
    };

    const whistleInterval = setInterval(playDistantWhistle, 24000);
    this.intervals.push(whistleInterval);
  }

  // 37. COZY FIREPLACE & LO-FI (Authentic hearth crackles, deep fire warmth, tape flutter & mellow 7th chords)
  private setupCozyFireplaceSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const brown = this.createBrownNoiseBuffer();
    const pink = this.createPinkNoiseBuffer();
    if (!brown || !pink) return;

    // 1. Roaring hearth ember lowpass bed
    const fireBedSrc = this.ctx.createBufferSource();
    fireBedSrc.buffer = brown;
    fireBedSrc.loop = true;
    const fireBedFilt = this.ctx.createBiquadFilter();
    fireBedFilt.type = 'lowpass';
    fireBedFilt.frequency.setValueAtTime(260, this.ctx.currentTime);
    const fireBedGain = this.ctx.createGain();
    fireBedGain.gain.setValueAtTime(0.38 * this.ambientLayerGain, this.ctx.currentTime);
    fireBedSrc.connect(fireBedFilt);
    fireBedFilt.connect(fireBedGain);
    fireBedGain.connect(parentGain);
    fireBedSrc.start();
    this.activeNodes.push(fireBedSrc, fireBedFilt, fireBedGain);

    // 2. Vinyl surface crackle & micro dust hiss
    const vinylHissSrc = this.ctx.createBufferSource();
    vinylHissSrc.buffer = pink;
    vinylHissSrc.loop = true;
    const vinylHissFilt = this.ctx.createBiquadFilter();
    vinylHissFilt.type = 'bandpass';
    vinylHissFilt.frequency.setValueAtTime(1400, this.ctx.currentTime);
    vinylHissFilt.Q.setValueAtTime(1.5, this.ctx.currentTime);
    const vinylHissGain = this.ctx.createGain();
    vinylHissGain.gain.setValueAtTime(0.08 * this.ambientLayerGain, this.ctx.currentTime);
    vinylHissSrc.connect(vinylHissFilt);
    vinylHissFilt.connect(vinylHissGain);
    vinylHissGain.connect(parentGain);
    vinylHissSrc.start();
    this.activeNodes.push(vinylHissSrc, vinylHissFilt, vinylHissGain);

    // 3. Randomized real wood spark pops & ember snaps
    const playWoodPop = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const burstCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < burstCount; i++) {
          const delay = Math.random() * 0.18;
          const now = this.ctx.currentTime + delay;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filt = this.ctx.createBiquadFilter();

          osc.type = Math.random() > 0.5 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(600 + Math.random() * 2200, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(1200 + Math.random() * 1800, now);
          filt.Q.setValueAtTime(4.0, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime((0.14 + Math.random() * 0.12) * this.triggerLayerGain, now + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

          osc.connect(filt);
          filt.connect(gain);
          gain.connect(parentGain);
          osc.start(now);
          osc.stop(now + 0.05);
        }
      } catch {}
    };

    const popInterval = setInterval(playWoodPop, 280);
    this.intervals.push(popInterval);

    // 4. Mellow Lo-Fi Rhodes electric piano chords (Cmaj7, Am7, Dm7, G7 chords with tape vibrato)
    const loFiChords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    let chordIdx = 0;

    const playLoFiChord = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const chord = loFiChords[chordIdx % loFiChords.length];
        chordIdx++;
        const now = this.ctx.currentTime;

        chord.forEach((freq, noteIdx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const lfo = this.ctx!.createOscillator();
          const lfoGain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Subtle tape flutter wow/flutter
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(4.2 + (Math.random() * 0.5), now);
          lfoGain.gain.setValueAtTime(1.8, now);
          lfo.connect(osc.detune);
          lfo.start(now);
          lfo.stop(now + 5.5);

          gain.gain.setValueAtTime(0.0001, now + noteIdx * 0.04);
          gain.gain.linearRampToValueAtTime(0.035 * this.weatherLayerGain, now + noteIdx * 0.04 + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0);

          osc.connect(gain);
          gain.connect(parentGain);
          osc.start(now + noteIdx * 0.04);
          osc.stop(now + 5.2);
        });
      } catch {}
    };

    playLoFiChord();
    const chordInterval = setInterval(playLoFiChord, 7200);
    this.intervals.push(chordInterval);
  }

  // 38. DEEP SPACE OBSERVATORY (Resonant cosmic drone, telescope gyro rotation hum, stellar dust LFO & sparkling star sweeps)
  private setupDeepSpaceObservatorySound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    if (!pink) return;

    // 1. Detuned cosmic sub-harmonic drone foundation (55Hz, 110Hz, 165Hz)
    const freqs = [55.0, 110.0, 164.8, 220.0];
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      osc.detune.setValueAtTime((i - 1.5) * 5, this.ctx!.currentTime);
      gain.gain.setValueAtTime((0.14 / (i + 1)) * this.ambientLayerGain, this.ctx!.currentTime);
      osc.connect(gain);
      gain.connect(parentGain);
      osc.start();
      this.activeNodes.push(osc, gain);
    });

    // 2. Telescope dome motorized gyro rotation & thermal cooling hum
    const gyroSrc = this.ctx.createBufferSource();
    gyroSrc.buffer = pink;
    gyroSrc.loop = true;
    const gyroFilt = this.ctx.createBiquadFilter();
    gyroFilt.type = 'bandpass';
    gyroFilt.frequency.setValueAtTime(420, this.ctx.currentTime);
    gyroFilt.Q.setValueAtTime(6.0, this.ctx.currentTime);

    // LFO sweeping gyro resonance
    const gyroLFO = this.ctx.createOscillator();
    gyroLFO.type = 'sine';
    gyroLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const gyroLFOGain = this.ctx.createGain();
    gyroLFOGain.gain.setValueAtTime(140, this.ctx.currentTime);
    gyroLFO.connect(gyroFilt.frequency);
    gyroLFO.start();

    const gyroGain = this.ctx.createGain();
    gyroGain.gain.setValueAtTime(0.18 * this.ambientLayerGain, this.ctx.currentTime);
    gyroSrc.connect(gyroFilt);
    gyroFilt.connect(gyroGain);
    gyroGain.connect(parentGain);
    gyroSrc.start();
    this.activeNodes.push(gyroSrc, gyroFilt, gyroLFO, gyroLFOGain, gyroGain);

    // 3. Starlight celestial pulses & crystalline telemetry twinkles
    const pulsarNotes = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
    const playPulsarPulse = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
          const note = pulsarNotes[Math.floor(Math.random() * pulsarNotes.length)];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const offset = i * 0.18;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, now + offset);

          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.linearRampToValueAtTime(0.025 * this.triggerLayerGain, now + offset + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.2);

          osc.connect(gain);
          gain.connect(parentGain);
          osc.start(now + offset);
          osc.stop(now + offset + 1.3);
        }
      } catch {}
    };

    const pulsarInterval = setInterval(playPulsarPulse, 4200);
    this.intervals.push(pulsarInterval);
  }

  // 39. VINTAGE VINYL JAZZ CAFE (Authentic turntable groove crackle, upright double-bass walk, brush snare & jazz keys)
  private setupVintageVinylJazzSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    const brown = this.createBrownNoiseBuffer();
    if (!pink || !brown) return;

    // 1. Vinyl needle surface groove continuous hiss
    const vinylSrc = this.ctx.createBufferSource();
    vinylSrc.buffer = pink;
    vinylSrc.loop = true;
    const vinylFilt = this.ctx.createBiquadFilter();
    vinylFilt.type = 'bandpass';
    vinylFilt.frequency.setValueAtTime(2200, this.ctx.currentTime);
    vinylFilt.Q.setValueAtTime(0.9, this.ctx.currentTime);
    const vinylGain = this.ctx.createGain();
    vinylGain.gain.setValueAtTime(0.22 * this.ambientLayerGain, this.ctx.currentTime);
    vinylSrc.connect(vinylFilt);
    vinylFilt.connect(vinylGain);
    vinylGain.connect(parentGain);
    vinylSrc.start();
    this.activeNodes.push(vinylSrc, vinylFilt, vinylGain);

    // 2. Periodic 33 RPM turntable revolutions click & random dust pops
    const playVinylClick = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + Math.random() * 1500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.015);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09 * this.triggerLayerGain, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

        osc.connect(gain);
        gain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 0.025);
      } catch {}
    };

    const rpmInterval = setInterval(playVinylClick, 1818); // 33.3 RPM periodic needle bump
    const popInterval = setInterval(() => {
      if (Math.random() > 0.35) playVinylClick();
    }, 450);
    this.intervals.push(rpmInterval, popInterval);

    // 3. Acoustic double-bass walking bassline notes (D2, F2, G2, A2, C3)
    const bassNotes = [73.42, 87.31, 98.00, 110.00, 130.81];
    let bassStep = 0;

    const playAcousticBass = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const freq = bassNotes[bassStep % bassNotes.length];
        bassStep++;

        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filt = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq * 0.5, now);

        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(280, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.24 * this.weatherLayerGain, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(filt);
        subOsc.connect(filt);
        filt.connect(gain);
        gain.connect(parentGain);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 1.7);
        subOsc.stop(now + 1.7);
      } catch {}
    };

    playAcousticBass();
    const bassInterval = setInterval(playAcousticBass, 1200); // 100 BPM swing walking bass
    this.intervals.push(bassInterval);

    // 4. Soft brushed jazz snare rhythm sweeps
    const playBrushedSnare = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = pink;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(3200, now);
        filt.Q.setValueAtTime(2.2, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.06 * this.triggerLayerGain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        src.connect(filt);
        filt.connect(gain);
        gain.connect(parentGain);
        src.start(now);
        src.stop(now + 0.3);
      } catch {}
    };

    const brushInterval = setInterval(playBrushedSnare, 600); // Swung jazz hi-hat/brush
    this.intervals.push(brushInterval);
  }

  // 40. STARLIT DESERT NIGHT (Warm nocturnal desert breeze, singing dune resonance, modal oud harmonics & crystal star twinkles)
  private setupStarlitDesertNightSound(parentGain: GainNode) {
    if (!this.ctx || !this.masterGain) return;

    const pink = this.createPinkNoiseBuffer();
    const brown = this.createBrownNoiseBuffer();
    if (!pink || !brown) return;

    // 1. Warm nocturnal desert wind sweeps
    const windSrc = this.ctx.createBufferSource();
    windSrc.buffer = pink;
    windSrc.loop = true;
    const windFilt = this.ctx.createBiquadFilter();
    windFilt.type = 'bandpass';
    windFilt.frequency.setValueAtTime(340, this.ctx.currentTime);
    windFilt.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const windLFO = this.ctx.createOscillator();
    windLFO.type = 'sine';
    windLFO.frequency.setValueAtTime(0.09, this.ctx.currentTime);
    const windLFOGain = this.ctx.createGain();
    windLFOGain.gain.setValueAtTime(120, this.ctx.currentTime);
    windLFO.connect(windFilt.frequency);
    windLFO.start();

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.36 * this.ambientLayerGain, this.ctx.currentTime);
    windSrc.connect(windFilt);
    windFilt.connect(windGain);
    windGain.connect(parentGain);
    windSrc.start();
    this.activeNodes.push(windSrc, windFilt, windLFO, windLFOGain, windGain);

    // 2. Singing sand dunes deep acoustic resonance (108Hz, 216Hz)
    const duneOsc = this.ctx.createOscillator();
    const duneGain = this.ctx.createGain();
    duneOsc.type = 'sine';
    duneOsc.frequency.setValueAtTime(108, this.ctx.currentTime);
    duneGain.gain.setValueAtTime(0.12 * this.ambientLayerGain, this.ctx.currentTime);
    duneOsc.connect(duneGain);
    duneGain.connect(parentGain);
    duneOsc.start();
    this.activeNodes.push(duneOsc, duneGain);

    // 3. Modal acoustic desert harmonics / Oud resonant plucked intervals
    const desertModes = [164.81, 196.00, 220.00, 246.94, 293.66, 329.63]; // E Phrygian / Hijaz modal scale
    let modeIdx = 0;

    const playDesertPluck = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const freq = desertModes[modeIdx % desertModes.length];
        modeIdx++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.045 * this.triggerLayerGain, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 4.0);
      } catch {}
    };

    const pluckInterval = setInterval(playDesertPluck, 5200);
    this.intervals.push(pluckInterval);

    // 4. Starlit crystal bell reflections
    const crystalNotes = [1318.51, 1567.98, 1975.53, 2637.02];
    const playCrystalTwinkle = () => {
      if (!this.ctx || !this.isRunning) return;
      try {
        const now = this.ctx.currentTime;
        const note = crystalNotes[Math.floor(Math.random() * crystalNotes.length)];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.022 * this.triggerLayerGain, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(parentGain);
        osc.start(now);
        osc.stop(now + 1.9);
      } catch {}
    };

    const twinkleInterval = setInterval(playCrystalTwinkle, 3600);
    this.intervals.push(twinkleInterval);
  }

  public stop(fadeDurationSec: number = 1.0) {
    if (!this.isRunning) return;
    this.isRunning = false;

    this.pendingCleanupTimeouts.forEach(t => clearTimeout(t));
    this.pendingCleanupTimeouts = [];

    const nodesToStop = [...this.activeNodes];
    const intervalsToClear = [...this.intervals];
    const channelGainToStop = this.currentChannelGain;
    this.activeNodes = [];
    this.intervals = [];
    this.currentChannelGain = null;

    if (this.ctx && channelGainToStop && fadeDurationSec > 0) {
      try {
        const now = this.ctx.currentTime;
        channelGainToStop.gain.cancelScheduledValues(now);
        channelGainToStop.gain.setValueAtTime(channelGainToStop.gain.value, now);
        channelGainToStop.gain.linearRampToValueAtTime(0.0001, now + fadeDurationSec);
      } catch {}

      setTimeout(() => {
        intervalsToClear.forEach(t => clearInterval(t));
        nodesToStop.forEach(node => {
          try {
            if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
            if ('disconnect' in node && typeof (node as any).disconnect === 'function') (node as any).disconnect();
          } catch {}
        });
        try { channelGainToStop.disconnect(); } catch {}
      }, (fadeDurationSec + 0.1) * 1000);
    } else {
      intervalsToClear.forEach(t => clearInterval(t));
      nodesToStop.forEach(node => {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
          if ('disconnect' in node && typeof (node as any).disconnect === 'function') (node as any).disconnect();
        } catch {}
      });
      if (channelGainToStop) {
        try { channelGainToStop.disconnect(); } catch {}
      }
    }

    this.thunderNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
        if ('disconnect' in node && typeof (node as any).disconnect === 'function') (node as any).disconnect();
      } catch {}
    });
    this.thunderNodes = [];
  }

  public setVolume(vol: number) {
    this.baseVolume = Math.max(0, Math.min(1, vol));
    const targetMultiplier = this.isDucked ? 0.8 : 1.0;
    this.volume = this.baseVolume * targetMultiplier;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setDucking(ducked: boolean, fadeDurationSec: number = 1.0) {
    this.isDucked = ducked;
    const targetMultiplier = ducked ? 0.8 : 1.0;
    this.volume = this.baseVolume * targetMultiplier;
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(
        Math.max(0.0001, this.volume),
        now + fadeDurationSec
      );
    } catch {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }
  }

  public getVolume(): number {
    return this.baseVolume;
  }

  public getIsDucked(): boolean {
    return this.isDucked;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  // =========================================================================
  // 3D SPATIAL AUDIO PUBLIC CONTROLS & HEAD-TRACKING INTERFACE
  // =========================================================================
  public setSpatial3DEnabled(enabled: boolean) {
    this.spatial3DEnabled = enabled;
    if (this.currentChannelGain && this.masterGain) {
      try {
        this.currentChannelGain.disconnect();
        if (enabled && this.spatialPannerMain) {
          this.currentChannelGain.connect(this.spatialPannerMain);
        } else {
          this.currentChannelGain.connect(this.masterGain);
        }
      } catch {}
    }
  }

  public getSpatial3DEnabled(): boolean {
    return this.spatial3DEnabled;
  }

  /**
   * Updates listener 3D orientation in real time from camera yaw & pitch
   * Provides genuine binaural head-tracking depth when exploring in 3D
   */
  public updateSpatialOrientation(yaw: number, pitch: number, roll: number = 0) {
    if (!this.ctx) return;
    const fx = -Math.sin(yaw) * Math.cos(pitch);
    const fy = Math.sin(pitch);
    const fz = -Math.cos(yaw) * Math.cos(pitch);

    const now = this.ctx.currentTime;
    const listener = this.ctx.listener;
    if (listener) {
      try {
        if (listener.forwardX) {
          listener.forwardX.setTargetAtTime(fx, now, 0.04);
          listener.forwardY.setTargetAtTime(fy, now, 0.04);
          listener.forwardZ.setTargetAtTime(fz, now, 0.04);
          listener.upX.setTargetAtTime(0, now, 0.04);
          listener.upY.setTargetAtTime(1, now, 0.04);
          listener.upZ.setTargetAtTime(0, now, 0.04);
        } else if ((listener as any).setOrientation) {
          (listener as any).setOrientation(fx, fy, fz, 0, 1, 0);
        }
      } catch {}
    }
  }

  /**
   * Adjusts binaural entrainment volume (0 = disabled, 1 = deep focus)
   */
  public setBinauralIntensity(intensity: number) {
    this.binauralIntensity = Math.max(0, Math.min(1, intensity));
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.setTargetAtTime(this.binauralIntensity * 0.08, this.ctx.currentTime, 0.1);
    }
  }

  public getBinauralIntensity(): number {
    return this.binauralIntensity;
  }

  /**
   * Sets binaural wave difference (10Hz = Alpha focus, 6Hz = Theta meditation, 3Hz = Delta rest)
   */
  public setBinauralDelta(delta: number) {
    this.binauralDelta = delta;
    if (this.binauralOscR && this.ctx) {
      this.binauralOscR.frequency.setTargetAtTime(432 + delta, this.ctx.currentTime, 0.2);
    }
  }

  public getBinauralDelta(): number {
    return this.binauralDelta;
  }

  /**
   * Returns current 3D coordinates of all active spatial sound nodes
   * for visual rendering in the 3D cinematic canvas
   */
  public getSpatialNodes() {
    const orbitRadius = 3.2;
    return [
      { id: 'env-main', label: '3D Ambient Horizon', x: 0, y: 0.2, z: -1.5, type: 'environment' },
      { id: 'sky-node', label: 'Overhead Weather Canopy', x: 0, y: 3.2, z: 0.2, type: 'sky' },
      { 
        id: 'orbit-node', 
        label: 'Circulating 3D Wind Vector', 
        x: Math.cos(this.orbitAngle) * orbitRadius, 
        y: Math.sin(this.orbitAngle * 1.5) * 0.8 + 0.5, 
        z: Math.sin(this.orbitAngle) * orbitRadius, 
        type: 'orbit' 
      },
      { id: 'hearth-node', label: 'Ground Acoustic Core', x: -1.8, y: -1.0, z: 1.2, type: 'hearth' },
      { id: 'binaural-node', label: '432Hz Binaural Center', x: 0, y: 0, z: 0, type: 'binaural' }
    ];
  }
}

export const themeAudio = new ThemeAudioManager();

// =========================================================================
// REAL-TIME AMBIENT SOUNDSCAPE MIXER ENGINE (FOR SPOTIFY WIDGETS HUB)
// =========================================================================
export interface AmbientLevels {
  rain: number;
  thunder: number;
  cafe: number;
  fire: number;
  binaural: number;
}

export class AmbientMixerEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private channelGains: Record<string, GainNode> = {};
  private intervals: any[] = [];

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.setupChannels();
      this.isRunning = true;
    } catch {}
  }

  private setupChannels() {
    if (!this.ctx || !this.masterGain) return;

    const channels: (keyof AmbientLevels)[] = ['rain', 'thunder', 'cafe', 'fire', 'binaural'];
    channels.forEach((ch) => {
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      gain.connect(this.masterGain!);
      this.channelGains[ch] = gain;
    });

    // Rain Channel
    const rainBuf = this.createNoiseBuffer(5);
    if (rainBuf && this.channelGains.rain) {
      const src = this.ctx.createBufferSource();
      src.buffer = rainBuf;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(1600, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(this.channelGains.rain);
      src.start();
    }

    // Thunder Channel
    if (this.channelGains.thunder) {
      const thunderTimer = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        const gain = this.channelGains.thunder?.gain.value || 0;
        if (gain > 0.05 && Math.random() > 0.4) {
          const osc = this.ctx.createOscillator();
          const tg = this.ctx.createGain();
          const now = this.ctx.currentTime;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(45, now);
          osc.frequency.exponentialRampToValueAtTime(20, now + 3.0);
          tg.gain.setValueAtTime(0.001, now);
          tg.gain.linearRampToValueAtTime(gain * 0.6, now + 0.3);
          tg.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
          osc.connect(tg);
          tg.connect(this.channelGains.thunder);
          osc.start(now);
          osc.stop(now + 3.3);
        }
      }, 9000);
      this.intervals.push(thunderTimer);
    }

    // Cafe Channel
    const cafeBuf = this.createNoiseBuffer(4);
    if (cafeBuf && this.channelGains.cafe) {
      const src = this.ctx.createBufferSource();
      src.buffer = cafeBuf;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(500, this.ctx.currentTime);
      filt.Q.setValueAtTime(2.0, this.ctx.currentTime);
      src.connect(filt);
      filt.connect(this.channelGains.cafe);
      src.start();
    }

    // Fireplace Channel
    if (this.channelGains.fire) {
      const fireBuf = this.createNoiseBuffer(3);
      if (fireBuf) {
        const src = this.ctx.createBufferSource();
        src.buffer = fireBuf;
        src.loop = true;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(3200, this.ctx.currentTime);
        filt.Q.setValueAtTime(3.5, this.ctx.currentTime);
        src.connect(filt);
        filt.connect(this.channelGains.fire);
        src.start();
      }

      const firePop = () => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(Math.random() * 4000 + 1500, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.1, now + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.connect(g);
        g.connect(this.channelGains.fire);
        osc.start(now);
        osc.stop(now + 0.025);
      };
      const popInterval = setInterval(() => {
        if (Math.random() > 0.4) firePop();
      }, 180);
      this.intervals.push(popInterval);
    }

    // Binaural Gamma Drone
    if (this.channelGains.binaural) {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc1.connect(this.channelGains.binaural);
      osc2.connect(this.channelGains.binaural);
      osc1.start();
      osc2.start();
    }
  }

  private createNoiseBuffer(seconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setLevels(levels: AmbientLevels, isMuted: boolean = false) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    (['rain', 'thunder', 'cafe', 'fire', 'binaural'] as (keyof AmbientLevels)[]).forEach((channel) => {
      const gainNode = this.channelGains[channel];
      if (gainNode) {
        const targetValue = isMuted ? 0 : levels[channel];
        gainNode.gain.setValueAtTime(targetValue, this.ctx!.currentTime);
      }
    });
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setDucking(ducked: boolean, fadeDurationSec: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const targetMultiplier = ducked ? 0.8 : 1.0;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.5 * targetMultiplier, now + fadeDurationSec);
    } catch {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0.5 * targetMultiplier, this.ctx.currentTime);
      }
    }
  }

  public stopAll() {
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
    this.isRunning = false;
  }
}

export const ambientSoundscapeMixer = new AmbientMixerEngine();

export function playTimerChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.8);
    });
  } catch {}
}
