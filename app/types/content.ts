export interface Scenario {
  id: string;
  location: string;
  prompt: string;
  minWords: number;
  scaffolds: string[];
  modelAnswer: string;
}

export interface BossQuest {
  id: string;
  week: number;
  title: string;
  description: string;
  reward: number;
  requirement: string;
}

export interface StreetMission {
  id: string;
  text: string;
  detail: string;
}

export interface StreetPhase {
  phase: number;
  phaseName: string;
  phaseEmoji: string;
  unlockAt: number;
  missions: StreetMission[];
}

export interface Brawler {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockAt: number;
}

interface FeedCardBase {
  id: string;
  emoji: string;
  location: string;
  scenario: string;
}

export type FeedCard =
  | (FeedCardBase & { type: 'passive'; modelResponse: string })
  | (FeedCardBase & { type: 'interactive'; prompt: string; minWords: number; scaffolds: string[] });
