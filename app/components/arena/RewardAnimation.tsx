import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';

interface Props {
  trophiesEarned: number;
  newTier?: string;
  location?: string;
  onDone: () => void;
}

export function RewardAnimation({ trophiesEarned, newTier, location, onDone }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current = Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]);
    animRef.current.start(onDone);
    return () => { animRef.current?.stop(); };
  }, []);

  const dismiss = () => {
    animRef.current?.stop();
    onDone();
  };

  return (
    <TouchableWithoutFeedback onPress={dismiss} accessibilityLabel="關閉獎勵" accessibilityRole="button">
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.earned}>+{trophiesEarned} 口杯</Text>
          {location && <Text style={styles.location}>📍 {location} 完成！</Text>}
          {newTier && <Text style={styles.tier}>升級！{newTier}</Text>}
          <Text style={styles.sub}>叻喎！撳任何位繼續</Text>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0c040',
  },
  emoji: { fontSize: 64 },
  earned: { color: '#f0c040', fontSize: 32, fontWeight: '800', marginTop: 12 },
  location: { color: '#a78bfa', fontSize: 14, fontWeight: '600', marginTop: 6 },
  tier: { color: '#e94560', fontSize: 18, fontWeight: '700', marginTop: 8 },
  sub: { color: '#aaa', fontSize: 15, marginTop: 8 },
});
