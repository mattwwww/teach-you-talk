import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeedHistoryState {
  seenCardIds: string[];
  respondedCardIds: string[];
  selfRatings: Record<string, number>;
  markSeen: (id: string) => void;
  markResponded: (id: string) => void;
  rateSelf: (id: string, stars: number) => void;
  loadFromStorage: () => Promise<void>;
}

export const useFeedHistory = create<FeedHistoryState>((set, get) => ({
  seenCardIds: [],
  respondedCardIds: [],
  selfRatings: {},

  markSeen: (id) => {
    if (get().seenCardIds.includes(id)) return;
    const updated = [...get().seenCardIds, id];
    set({ seenCardIds: updated });
    AsyncStorage.setItem('seenCards', JSON.stringify(updated));
  },

  markResponded: (id) => {
    if (get().respondedCardIds.includes(id)) return;
    const updated = [...get().respondedCardIds, id];
    set({ respondedCardIds: updated });
    AsyncStorage.setItem('respondedCards', JSON.stringify(updated));
  },

  rateSelf: (id, stars) => {
    const updated = { ...get().selfRatings, [id]: stars };
    set({ selfRatings: updated });
    AsyncStorage.setItem('selfRatings', JSON.stringify(updated));
  },

  loadFromStorage: async () => {
    const seen = await AsyncStorage.getItem('seenCards');
    const responded = await AsyncStorage.getItem('respondedCards');
    const ratings = await AsyncStorage.getItem('selfRatings');
    set({
      seenCardIds: seen ? JSON.parse(seen) : [],
      respondedCardIds: responded ? JSON.parse(responded) : [],
      selfRatings: ratings ? JSON.parse(ratings) : {},
    });
  },
}));
