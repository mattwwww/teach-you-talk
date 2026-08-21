import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { RecordState } from '../../hooks/useVoiceRecord';

interface Props {
  state: RecordState;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({ state, onStart, onStop }: Props) {
  if (state === 'idle') {
    return (
      <TouchableOpacity
        style={[styles.btn, styles.idle]}
        onPress={onStart}
        accessibilityLabel="開始錄音"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>🎤</Text>
        <Text style={styles.label}>撳嚟錄音</Text>
      </TouchableOpacity>
    );
  }

  if (state === 'recording') {
    return (
      <TouchableOpacity
        style={[styles.btn, styles.recording]}
        onPress={onStop}
        accessibilityLabel="停止錄音"
        accessibilityRole="button"
      >
        <View style={styles.pulse} />
        <Text style={styles.icon}>⏹</Text>
        <Text style={styles.label}>錄緊... 撳停</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.btn, styles.done]} accessibilityLabel="錄音完成">
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.label}>錄咗喇</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  idle: { backgroundColor: '#e94560' },
  recording: { backgroundColor: '#ef4444' },
  done: { backgroundColor: '#4ade80' },
  icon: { fontSize: 32 },
  label: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 4 },
  pulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(239,68,68,0.3)',
  },
});
