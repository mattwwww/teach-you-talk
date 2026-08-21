import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type Tier } from '../../store/userProgress';

const TIER_COLORS: Record<Tier, string> = {
  '啞仔': '#555',
  '識應聲': '#4a90d9',
  '識表達': '#9b59b6',
  '識傾偈': '#e67e22',
  '話王': '#f0c040',
};

interface Props {
  tier: Tier;
}

export function TierBadge({ tier }: Props) {
  const color = TIER_COLORS[tier];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{tier}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: { fontSize: 12, fontWeight: '700' },
});
