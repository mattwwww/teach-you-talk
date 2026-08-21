import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuestLogState {
  completedMissions: string[];
  reflections: Record<string, string>;
  completeMission: (id: string, reflection: string) => void;
  loadFromStorage: () => Promise<void>;
}

export const useQuestLog = create<QuestLogState>((set, get) => ({
  completedMissions: [],
  reflections: {},

  completeMission: (id, reflection) => {
    if (get().completedMissions.includes(id)) return;
    const completedMissions = [...get().completedMissions, id];
    const reflections = { ...get().reflections, [id]: reflection };
    set({ completedMissions, reflections });
    AsyncStorage.setItem('completedMissions', JSON.stringify(completedMissions));
    AsyncStorage.setItem('reflections', JSON.stringify(reflections));
  },

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem('completedMissions');
    const rawRef = await AsyncStorage.getItem('reflections');
    set({
      completedMissions: raw ? JSON.parse(raw) : [],
      reflections: rawRef ? JSON.parse(rawRef) : {},
    });
  },
}));
