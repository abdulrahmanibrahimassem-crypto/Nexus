import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AgentGender, AgentAccentColor } from '../components/AgentAvatarSVG';
import { agentVoice } from '../utils/AgentVoiceManager';

export type AgentId = 'atlas' | 'pulse' | 'oracle';

export interface AgentProfile {
  id: AgentId;
  defaultName: string;
  name: string;
  gender: AgentGender;
  role: string;
  badge: string;
  accentColor: AgentAccentColor;
  voiceProfile: string;
  voicePitch: number;
  voiceRate: number;
  activePresetIndex: number;
  description: string;
  directive: string;
  catchphrase: string;
}

export type AllAgentProfiles = Record<AgentId, AgentProfile>;

// Legacy interface for backward compatibility
export interface LegacyAgentPersonaConfig {
  name: string;
  gender: 'male' | 'female' | 'neutral';
  voiceProfile: string;
}

export interface LegacyAllPersonas {
  atlas: LegacyAgentPersonaConfig;
  pulse: LegacyAgentPersonaConfig;
  oracle: LegacyAgentPersonaConfig;
}

export const VOICE_PROFILES = [
  { id: 'Neural-Alpha (Deep Baritone)', label: 'Neural-Alpha (Deep Baritone)', gender: 'male', pitch: 0.65, rate: 0.95, desc: 'Authoritative, resonant, deep male tone' },
  { id: 'Neural-Beta (Energetic Soprano)', label: 'Neural-Beta (Energetic Soprano)', gender: 'female', pitch: 1.35, rate: 1.05, desc: 'Vibrant, clear, sharp feminine voice' },
  { id: 'Neural-Gamma (Cybernetic Resonance)', label: 'Neural-Gamma (Cybernetic Resonance)', gender: 'neutral', pitch: 0.85, rate: 1.05, desc: 'Synthetic modulated AI matrix tone' },
  { id: 'Neural-Delta (Calm Instructor)', label: 'Neural-Delta (Calm Instructor)', gender: 'neutral', pitch: 0.95, rate: 0.92, desc: 'Measured, pedagogical, soothing voice' },
  { id: 'Quantum Bass (Heavy Resonance)', label: 'Quantum Bass (Heavy Resonance)', gender: 'male', pitch: 0.55, rate: 0.9, desc: 'Ultra-low frequency cyber commander' },
  { id: 'Velvet Whisper (Soft Ambient)', label: 'Velvet Whisper (Soft Ambient)', gender: 'female', pitch: 1.15, rate: 0.88, desc: 'Gentle, focused, ambient co-pilot' },
  { id: 'Hyper-Matrix (Rapid Tech)', label: 'Hyper-Matrix (Rapid Tech)', gender: 'neutral', pitch: 1.1, rate: 1.15, desc: 'Fast tactical telemetry advisor' },
];

export const DEFAULT_AGENT_PROFILES: AllAgentProfiles = {
  atlas: {
    id: 'atlas',
    defaultName: 'Atlas',
    name: 'Atlas',
    gender: 'male',
    role: 'Chief Systems Architect & Pipeline Engineer',
    badge: 'SYSTEMS CO-PILOT',
    accentColor: 'cyan',
    voiceProfile: 'Neural-Alpha (Deep Baritone)',
    voicePitch: 0.65,
    voiceRate: 0.95,
    activePresetIndex: 0,
    description: 'Automates AST syntax validation, visual pipeline orchestration, and continuous architecture integrity.',
    directive: 'Enforce zero-regression code safety, optimize distributed micro-pipelines, and provide real-time runtime diagnostics.',
    catchphrase: 'Atlas online. Systems architecture and execution pipelines synchronized.',
  },
  pulse: {
    id: 'pulse',
    defaultName: 'Pulse',
    name: 'Pulse',
    gender: 'female',
    role: 'Real-Time Biometrics & Hardware Telemetry Operative',
    badge: 'TELEMETRY SPECIALIST',
    accentColor: 'emerald',
    voiceProfile: 'Neural-Beta (Energetic Soprano)',
    voicePitch: 1.35,
    voiceRate: 1.05,
    activePresetIndex: 0,
    description: 'Monitors cognitive rhythm, biometric focus intervals, IoT hardware sensor streams, and ambient soundscapes.',
    directive: 'Maintain peak cognitive equilibrium, prevent focus fatigue through pacing intervals, and bridge hardware sensors.',
    catchphrase: 'Pulse telemetry active. Biometric equilibrium locked at 98.4% efficiency.',
  },
  oracle: {
    id: 'oracle',
    defaultName: 'Oracle',
    name: 'Oracle',
    gender: 'female',
    role: 'Cyber Threat Intelligence & Deep Knowledge Advisor',
    badge: 'CYBER INTELLIGENCE',
    accentColor: 'purple',
    voiceProfile: 'Neural-Gamma (Cybernetic Resonance)',
    voicePitch: 0.85,
    voiceRate: 1.0,
    activePresetIndex: 0,
    description: 'Inspects network packets for anomalous vectors, decodes complex academic research, and briefs on tactical security.',
    directive: 'Quarantine suspicious socket vectors instantly, summarize deep academic corpora, and shield user infrastructure.',
    catchphrase: 'Oracle threat heuristics active. Perimeter security verified and intelligence matrix online.',
  },
};

const STORAGE_KEY_V3 = 'zenith_agent_profiles_v3';
const LEGACY_STORAGE_KEY = 'zenith_ai_agent_personas_v2';

interface AgentStudioContextType {
  agents: AllAgentProfiles;
  personas: LegacyAllPersonas; // backward compatibility
  isStudioOpen: boolean;
  selectedAgentId: AgentId;
  speakingAgentId: AgentId | null;
  updateAgent: (id: AgentId, updates: Partial<AgentProfile>) => void;
  updatePersona: (agentKey: AgentId, field: keyof LegacyAgentPersonaConfig, value: string) => void;
  resetAgent: (id: AgentId) => void;
  resetAllAgents: () => void;
  speakAgent: (id: AgentId, customText?: string) => void;
  stopSpeaking: () => void;
  openStudioModal: (initialAgentId?: AgentId) => void;
  closeStudioModal: () => void;
  setSelectedAgentId: (id: AgentId) => void;
}

const AgentStudioContext = createContext<AgentStudioContextType | undefined>(undefined);

export const AgentStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<AllAgentProfiles>(() => {
    if (typeof window === 'undefined') return DEFAULT_AGENT_PROFILES;
    
    // Check primary V3 storage
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY_V3);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        return {
          atlas: { ...DEFAULT_AGENT_PROFILES.atlas, ...parsed.atlas },
          pulse: { ...DEFAULT_AGENT_PROFILES.pulse, ...parsed.pulse },
          oracle: { ...DEFAULT_AGENT_PROFILES.oracle, ...parsed.oracle },
        };
      }
    } catch {
      // fallback
    }

    // Check legacy V2 storage
    try {
      const savedV2 = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedV2) {
        const parsedV2 = JSON.parse(savedV2);
        return {
          atlas: {
            ...DEFAULT_AGENT_PROFILES.atlas,
            name: parsedV2.atlas?.name || DEFAULT_AGENT_PROFILES.atlas.name,
            gender: parsedV2.atlas?.gender || DEFAULT_AGENT_PROFILES.atlas.gender,
            voiceProfile: parsedV2.atlas?.voiceProfile || DEFAULT_AGENT_PROFILES.atlas.voiceProfile,
          },
          pulse: {
            ...DEFAULT_AGENT_PROFILES.pulse,
            name: parsedV2.pulse?.name || DEFAULT_AGENT_PROFILES.pulse.name,
            gender: parsedV2.pulse?.gender || DEFAULT_AGENT_PROFILES.pulse.gender,
            voiceProfile: parsedV2.pulse?.voiceProfile || DEFAULT_AGENT_PROFILES.pulse.voiceProfile,
          },
          oracle: {
            ...DEFAULT_AGENT_PROFILES.oracle,
            name: parsedV2.oracle?.name || DEFAULT_AGENT_PROFILES.oracle.name,
            gender: parsedV2.oracle?.gender || DEFAULT_AGENT_PROFILES.oracle.gender,
            voiceProfile: parsedV2.oracle?.voiceProfile || DEFAULT_AGENT_PROFILES.oracle.voiceProfile,
          },
        };
      }
    } catch {
      // fallback
    }

    return DEFAULT_AGENT_PROFILES;
  });

  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('atlas');
  const [speakingAgentId, setSpeakingAgentId] = useState<AgentId | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(agents));
      
      // Also sync legacy format for any components reading legacy key directly
      const legacyFormat: LegacyAllPersonas = {
        atlas: { name: agents.atlas.name, gender: agents.atlas.gender, voiceProfile: agents.atlas.voiceProfile },
        pulse: { name: agents.pulse.name, gender: agents.pulse.gender, voiceProfile: agents.pulse.voiceProfile },
        oracle: { name: agents.oracle.name, gender: agents.oracle.gender, voiceProfile: agents.oracle.voiceProfile },
      };
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyFormat));
    } catch (e) {
      console.warn('Failed to save agent profiles to localStorage:', e);
    }
  }, [agents]);

  // Handle multi-tab cross-sync via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_V3 && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAgents({
            atlas: { ...DEFAULT_AGENT_PROFILES.atlas, ...parsed.atlas },
            pulse: { ...DEFAULT_AGENT_PROFILES.pulse, ...parsed.pulse },
            oracle: { ...DEFAULT_AGENT_PROFILES.oracle, ...parsed.oracle },
          });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateAgent = useCallback((id: AgentId, updates: Partial<AgentProfile>) => {
    setAgents(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
      },
    }));
  }, []);

  const updatePersona = useCallback((agentKey: AgentId, field: keyof LegacyAgentPersonaConfig, value: string) => {
    setAgents(prev => ({
      ...prev,
      [agentKey]: {
        ...prev[agentKey],
        [field]: value,
      },
    }));
  }, []);

  const resetAgent = useCallback((id: AgentId) => {
    setAgents(prev => ({
      ...prev,
      [id]: { ...DEFAULT_AGENT_PROFILES[id] },
    }));
  }, []);

  const resetAllAgents = useCallback(() => {
    setAgents(DEFAULT_AGENT_PROFILES);
  }, []);

  const stopSpeaking = useCallback(() => {
    agentVoice.stop();
    setSpeakingAgentId(null);
  }, []);

  const speakAgent = useCallback((id: AgentId, customText?: string) => {
    const agent = agents[id];
    if (!agent) return;

    const textToSpeak = customText || `${agent.name} online. ${agent.catchphrase}`;
    setSpeakingAgentId(id);

    agentVoice.speak(
      textToSpeak,
      agent.voiceProfile,
      () => setSpeakingAgentId(id),
      () => setSpeakingAgentId(null),
      agent.voicePitch,
      agent.voiceRate
    );
  }, [agents]);

  const openStudioModal = useCallback((initialAgentId?: AgentId) => {
    if (initialAgentId) {
      setSelectedAgentId(initialAgentId);
    }
    setIsStudioOpen(true);
  }, []);

  const closeStudioModal = useCallback(() => {
    stopSpeaking();
    setIsStudioOpen(false);
  }, [stopSpeaking]);

  const personas = useMemo<LegacyAllPersonas>(() => ({
    atlas: { name: agents.atlas.name, gender: agents.atlas.gender, voiceProfile: agents.atlas.voiceProfile },
    pulse: { name: agents.pulse.name, gender: agents.pulse.gender, voiceProfile: agents.pulse.voiceProfile },
    oracle: { name: agents.oracle.name, gender: agents.oracle.gender, voiceProfile: agents.oracle.voiceProfile },
  }), [agents]);

  const value = useMemo(() => ({
    agents,
    personas,
    isStudioOpen,
    selectedAgentId,
    speakingAgentId,
    updateAgent,
    updatePersona,
    resetAgent,
    resetAllAgents,
    speakAgent,
    stopSpeaking,
    openStudioModal,
    closeStudioModal,
    setSelectedAgentId,
  }), [
    agents,
    personas,
    isStudioOpen,
    selectedAgentId,
    speakingAgentId,
    updateAgent,
    updatePersona,
    resetAgent,
    resetAllAgents,
    speakAgent,
    stopSpeaking,
    openStudioModal,
    closeStudioModal,
  ]);

  return (
    <AgentStudioContext.Provider value={value}>
      {children}
    </AgentStudioContext.Provider>
  );
};

export function useAgentStudio() {
  const context = useContext(AgentStudioContext);
  if (!context) {
    throw new Error('useAgentStudio must be used within an AgentStudioProvider');
  }
  return context;
}

// Seamless backward-compatible usePersona hook
export function usePersona() {
  const context = useContext(AgentStudioContext);
  if (!context) {
    // If used outside provider in any standalone testing context, return fallback
    return {
      personas: {
        atlas: { name: 'Atlas', gender: 'male' as const, voiceProfile: 'Neural-Alpha (Deep Baritone)' },
        pulse: { name: 'Pulse', gender: 'female' as const, voiceProfile: 'Neural-Beta (Energetic Soprano)' },
        oracle: { name: 'Oracle', gender: 'female' as const, voiceProfile: 'Neural-Gamma (Cybernetic Resonance)' },
      },
      updatePersona: () => {},
    };
  }
  return {
    personas: context.personas,
    updatePersona: context.updatePersona,
    agents: context.agents,
    updateAgent: context.updateAgent,
  };
}
