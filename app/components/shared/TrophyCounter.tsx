import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserProgress } from '../../store/userProgress';
import { type Brawler } from '../../types/content';

const BRAWLERS: Brawler[] = require('../../content/brawlers.json');

export function TrophyCounter() {
  const { trophies, tier, activeBrawlerIndex } = useUserProgress();
  const brawler = BRAWLERS[activeBrawlerIndex];

  return (
    <View style={styles.container}>
      {brawler && <Text style={styles.brawler}>{brawler.emoji}</Text>}
      <Text style={styles.tier}>{tier}</Text>
      <Text style={styles.trophy}>🏆 {trophies}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
  },
  brawler: { fontSize: 16 },
  tier: { color: '#f0c040', fontSize: 13, fontWeight: '700' },
  trophy: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
