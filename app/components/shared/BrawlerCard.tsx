import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { type Brawler } from '../../types/content';

interface Props {
  brawler: Brawler;
  unlocked: boolean;
  active: boolean;
  onSelect: () => void;
}

export function BrawlerCard({ brawler, unlocked, active, onSelect }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive, !unlocked && styles.cardLocked]}
      onPress={onSelect}
      disabled={!unlocked}
      accessibilityLabel={active ? `${brawler.name} — 使用中` : unlocked ? `選擇角色：${brawler.name}` : `${brawler.name} — 未解鎖`}
      accessibilityRole="button"
    >
      <Text style={styles.emoji}>{unlocked ? brawler.emoji : '🔒'}</Text>
      <Text style={[styles.name, !unlocked && styles.locked]}>{brawler.name}</Text>
      <Text style={styles.desc}>
        {unlocked ? brawler.description : `${brawler.unlockAt} 口杯先解鎖`}
      </Text>
      {active && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>使用中</Text></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardActive: { borderColor: '#f0c040' },
  cardLocked: { opacity: 0.4 },
  emoji: { fontSize: 36, marginBottom: 8 },
  name: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  locked: { color: '#555' },
  desc: { color: '#888', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  activeBadge: {
    backgroundColor: '#f0c040',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  activeBadgeText: { color: '#000', fontSize: 10, fontWeight: '800' },
});
