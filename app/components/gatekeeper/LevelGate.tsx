import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { cantoneseWordCount, encouragement } from '../../utils/cantonese';
import { ProgressBar } from '../shared/ProgressBar';

interface Props {
  input: string;
  minWords: number;
  scaffolds: string[];
  onAccept: () => void;
}

export function LevelGate({ input, minWords, scaffolds, onAccept }: Props) {
  const count = cantoneseWordCount(input);
  const shortage = minWords - count;

  if (count >= minWords) {
    return (
      <View>
        <Text style={styles.encourage}>{encouragement(count, minWords)}</Text>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={onAccept}
          accessibilityLabel="提交答案"
          accessibilityRole="button"
        >
          <Text style={styles.acceptText}>✅ 提交答案</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pct = Math.min((count / minWords) * 100, 99);

  return (
    <View style={styles.gate}>
      <Text style={styles.title}>⚡ 角色升級中...</Text>
      <View style={styles.progressRow}>
        <ProgressBar pct={pct} color="#e94560" />
        <Text style={styles.progressLabel}>{count} / {minWords} 字</Text>
      </View>
      <Text style={styles.body}>
        再加 <Text style={styles.highlight}>{shortage}</Text> 隻字先解鎖！
      </Text>
      {scaffolds.length > 0 && (
        <>
          <Text style={styles.tryLabel}>試下講：</Text>
          {scaffolds.map((s, i) => (
            <Text key={i} style={styles.scaffold}>👉 {s}</Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  title: { color: '#f0c040', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  progressRow: { marginBottom: 10 },
  progressLabel: { color: '#888', fontSize: 12, textAlign: 'right', marginTop: 4 },
  body: { color: '#fff', fontSize: 16, lineHeight: 26, marginBottom: 12 },
  highlight: { color: '#e94560', fontWeight: '800' },
  tryLabel: { color: '#888', fontSize: 13, marginBottom: 6 },
  scaffold: { color: '#a8d8ea', fontSize: 15, lineHeight: 26 },
  encourage: { color: '#4ade80', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 12, marginBottom: 4 },
  acceptBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  acceptText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
