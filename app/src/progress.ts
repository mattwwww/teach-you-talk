import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { levels } from './data';

export type PracticeSession = {
  id: string;
  practiceId: string;
  place: string;
  difficulty: number;
  difficultyName: string;
  targetChars: number;
  requirement: string;
  mode: 'voice' | 'text';
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  transcript: string;
  duration: number;
  voiceScore: number | null;
  contentScore: number | null;
};

type NewPracticeSession = Omit<PracticeSession, 'id' | 'status' | 'startedAt' | 'completedAt' | 'duration' | 'voiceScore' | 'contentScore'>;

type ProgressState = {
  hydrated: boolean;
  xp: number;
  streak: number;
  lastPractice: string | null;
  completedMissions: string[];
  completedPractices: string[];
  quickResponses: string[];
  claimedRewards: Record<string, string>;
  sessionHistory: PracticeSession[];
  hydrate: () => Promise<void>;
  finishPractice: (id: string, xp?: number) => void;
  finishMission: (id: string, xp: number) => void;
  finishQuick: (id: string) => void;
  claimReward: (id: string, requiredXp: number) => string | null;
  startPracticeSession: (session: NewPracticeSession) => string;
  updatePracticeSession: (id: string, updates: Partial<PracticeSession>) => void;
  reset: () => Promise<void>;
};

const KEY = 'hoi-hau-progress-v1';

function nextDailyState(lastPractice: string | null) {
  const today = new Date().toDateString();
  if (lastPractice === today) return { streakChange: 0, today };
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return { streakChange: lastPractice === yesterday ? 1 : -1, today };
}

function persist(state: ProgressState) {
  AsyncStorage.setItem(KEY, JSON.stringify({
    xp: state.xp,
    streak: state.streak,
    lastPractice: state.lastPractice,
    completedMissions: state.completedMissions,
    completedPractices: state.completedPractices,
    quickResponses: state.quickResponses,
    claimedRewards: state.claimedRewards,
    sessionHistory: state.sessionHistory,
  })).catch(() => {});
}

export const useProgress = create<ProgressState>((set, get) => ({
  hydrated: false,
  xp: 0,
  streak: 0,
  lastPractice: null,
  completedMissions: [],
  completedPractices: [],
  quickResponses: [],
  claimedRewards: {},
  sessionHistory: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ ...JSON.parse(raw), hydrated: true });
      else set({ hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  finishPractice: (id, earned = 20) => {
    const current = get();
    const day = nextDailyState(current.lastPractice);
    const next = {
      xp: current.xp + earned,
      streak: day.streakChange === 0 ? current.streak : day.streakChange > 0 ? current.streak + 1 : 1,
      lastPractice: day.today,
      completedPractices: current.completedPractices.includes(id)
        ? current.completedPractices
        : [...current.completedPractices, id],
    };
    set(next);
    persist(get());
  },
  finishMission: (id, earned) => {
    const current = get();
    if (current.completedMissions.includes(id)) return;
    set({ xp: current.xp + earned, completedMissions: [...current.completedMissions, id] });
    persist(get());
  },
  finishQuick: (id) => {
    const current = get();
    if (current.quickResponses.includes(id)) return;
    set({ xp: current.xp + 5, quickResponses: [...current.quickResponses, id] });
    persist(get());
  },
  claimReward: (id, requiredXp) => {
    const current = get();
    if (current.xp < requiredXp) return null;
    if (current.claimedRewards[id]) return current.claimedRewards[id];
    const code = `HH-${id.slice(0, 3).toUpperCase()}-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    set({ claimedRewards: { ...current.claimedRewards, [id]: code } });
    persist(get());
    return code;
  },
  startPracticeSession: (session) => {
    const id = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const record: PracticeSession = {
      ...session,
      id,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      duration: 0,
      voiceScore: null,
      contentScore: null,
    };
    set({ sessionHistory: [record, ...get().sessionHistory] });
    persist(get());
    return id;
  },
  updatePracticeSession: (id, updates) => {
    set({
      sessionHistory: get().sessionHistory.map((session) => session.id === id ? { ...session, ...updates } : session),
    });
    persist(get());
  },
  reset: async () => {
    const { claimedRewards, sessionHistory } = get();
    set({ xp: 0, streak: 0, lastPractice: null, completedMissions: [], completedPractices: [], quickResponses: [], claimedRewards, sessionHistory });
    persist(get());
  },
}));

export function getLevel(xp: number) {
  return [...levels].reverse().find((level) => xp >= level.at) ?? levels[0]!;
}

export function getNextLevel(xp: number) {
  return levels.find((level) => level.at > xp);
}
