import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  duration: number;
  running: boolean;
  onExpire: () => void;
}

export function MatchTimer({ duration, running, onExpire }: Props) {
  const [seconds, setSeconds] = useState(duration);
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    setSeconds(duration);
  }, [duration]);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { onExpireRef.current(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  const pct = seconds / duration;
  const color = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#ef4444';

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color }]}>{seconds}</Text>
      <Text style={styles.label}>秒</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  time: { fontSize: 48, fontWeight: '800' },
  label: { color: '#888', fontSize: 14, marginTop: -4 },
});
