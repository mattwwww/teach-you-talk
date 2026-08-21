import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  pct: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ pct, color = '#f0c040', height = 6 }: Props) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <View
      style={[styles.track, { height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', backgroundColor: '#1a1a2e', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  fill: { borderRadius: 3 },
});
