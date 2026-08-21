import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Brawler } from '../types/content';

export type Tier = '啞仔' | '識應聲' | '識表達' | '識傾偈' | '話王';

const TIER_THRESHOLDS: { threshold: number; tier: Tier }[] = [
  { threshold: 0, tier: '啞仔' },
  { threshold: 30, tier: '識應聲' },
  { threshold: 100, tier: '識表達' },
  { threshold: 250, tier: '識傾偈' },
  { threshold: 500, tier: '話王' },
];

const BRAWLER_UNLOCKS: number[] = (require('../content/brawlers.json') as Brawler[]).map((b) => b.unlockAt);

function getTier(trophies: number): Tier {
  let current: Tier = '啞仔';
  for (const { threshold, tier } of TIER_THRESHOLDS) {
    if (trophies >= threshold) current = tier;
  }
  return current;
}

function getUnlockedBrawlers(trophies: number): number[] {
  return BRAWLER_UNLOCKS.reduce<number[]>((acc, unlockAt, i) => {
    if (trophies >= unlockAt) acc.push(i);
    return acc;
  }, []);
}

interface UserProgressState {
  trophies: number;
  tier: Tier;
  completedScenarios: string[];
  unlockedBrawlerIndexes: number[];
  activeBrawlerIndex: number;
  streakDays: number;
  bestStreak: number;
  totalArenaRounds: number;
  trophiesEarnedToday: number;
  lastActiveDate: string | null;
  newlyUnlockedBrawlerIndex: number | null;
  newBestStreak: boolean;
  addTrophies: (amount: number) => void;
  markScenarioComplete: (id: string) => void;
  incrementArenaRounds: () => void;
  setActiveBrawler: (index: number) => void;
  dismissUnlockBanner: () => void;
  dismissBestStreakBanner: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useUserProgress = create<UserProgressState>((set, get) => ({
  trophies: 0,
  tier: '啞仔',
  completedScenarios: [],
  unlockedBrawlerIndexes: [0],
  activeBrawlerIndex: 0,
  streakDays: 0,
  bestStreak: 0,
  totalArenaRounds: 0,
  trophiesEarnedToday: 0,
  lastActiveDate: null,
  newlyUnlockedBrawlerIndex: null,
  newBestStreak: false,

  addTrophies: (amount) => {
    const prev = get().trophies;
    const newTrophies = prev + amount;
    const newTier = getTier(newTrophies);
    const unlockedBrawlerIndexes = getUnlockedBrawlers(newTrophies);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const last = get().lastActiveDate;
    let streakDays: number;
    if (last === today) {
      streakDays = get().streakDays;
    } else if (last === yesterday) {
      streakDays = get().streakDays + 1;
    } else {
      streakDays = 1;
    }

    const prevBest = get().bestStreak;
    const bestStreak = Math.max(prevBest, streakDays);
    const trophiesEarnedToday = (last === today ? get().trophiesEarnedToday : 0) + amount;
    const prevUnlocked = get().unlockedBrawlerIndexes;
    const newlyUnlockedBrawlerIndex = unlockedBrawlerIndexes.length > prevUnlocked.length
      ? unlockedBrawlerIndexes[unlockedBrawlerIndexes.length - 1]
      : null;
    const newBestStreak = last !== today && last === yesterday && streakDays > prevBest && streakDays > 1;
    set({ trophies: newTrophies, tier: newTier, unlockedBrawlerIndexes, streakDays, bestStreak, trophiesEarnedToday, lastActiveDate: today, newlyUnlockedBrawlerIndex, newBestStreak });
    AsyncStorage.setItem('trophies', String(newTrophies));
    AsyncStorage.setItem('tier', newTier);
    AsyncStorage.setItem('unlockedBrawlers', JSON.stringify(unlockedBrawlerIndexes));
    AsyncStorage.setItem('streakDays', String(streakDays));
    AsyncStorage.setItem('bestStreak', String(bestStreak));
    AsyncStorage.setItem('trophiesEarnedToday', String(trophiesEarnedToday));
    AsyncStorage.setItem('lastActiveDate', today);
  },

  dismissUnlockBanner: () => set({ newlyUnlockedBrawlerIndex: null }),
  dismissBestStreakBanner: () => set({ newBestStreak: false }),

  markScenarioComplete: (id) => {
    if (get().completedScenarios.includes(id)) return;
    const updated = [...get().completedScenarios, id];
    set({ completedScenarios: updated });
    AsyncStorage.setItem('completedScenarios', JSON.stringify(updated));
  },

  incrementArenaRounds: () => {
    const rounds = get().totalArenaRounds + 1;
    set({ totalArenaRounds: rounds });
    AsyncStorage.setItem('totalArenaRounds', String(rounds));
  },

  setActiveBrawler: (index) => {
    set({ activeBrawlerIndex: index });
    AsyncStorage.setItem('activeBrawler', String(index));
  },

  loadFromStorage: async () => {
    const trophies = Number((await AsyncStorage.getItem('trophies')) ?? '0');
    const tier = ((await AsyncStorage.getItem('tier')) ?? '啞仔') as Tier;
    const raw = await AsyncStorage.getItem('completedScenarios');
    const completedScenarios = raw ? JSON.parse(raw) : [];
    const rawBrawlers = await AsyncStorage.getItem('unlockedBrawlers');
    const unlockedBrawlerIndexes = rawBrawlers ? JSON.parse(rawBrawlers) : [0];
    const activeBrawlerIndex = Number((await AsyncStorage.getItem('activeBrawler')) ?? '0');
    const savedStreak = Number((await AsyncStorage.getItem('streakDays')) ?? '0');
    const bestStreak = Number((await AsyncStorage.getItem('bestStreak')) ?? '0');
    const totalArenaRounds = Number((await AsyncStorage.getItem('totalArenaRounds')) ?? '0');
    const lastActiveDate = await AsyncStorage.getItem('lastActiveDate');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streakValid = lastActiveDate === today || lastActiveDate === yesterday;
    const streakDays = streakValid ? savedStreak : 0;
    const trophiesEarnedToday = lastActiveDate === today
      ? Number((await AsyncStorage.getItem('trophiesEarnedToday')) ?? '0')
      : 0;
    set({ trophies, tier, completedScenarios, unlockedBrawlerIndexes, activeBrawlerIndex, streakDays, bestStreak, totalArenaRounds, trophiesEarnedToday, lastActiveDate });
  },
}));
