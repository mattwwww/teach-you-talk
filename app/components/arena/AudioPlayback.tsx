import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

interface Props {
  uri: string;
  modelAnswer: string;
  onRate?: (stars: number) => void;
}

const STAR_LABELS = ['', '😶 差好遠', '😐 差唔多', '😄 好掂'];

export function AudioPlayback({ uri, modelAnswer, onRate }: Props) {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playRecording = async () => {
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    const { sound: s } = await Audio.Sound.createAsync({ uri });
    soundRef.current = s;
    setPlaying(true);
    await s.playAsync();
    s.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) setPlaying(false);
    });
  };

  const handleRate = (stars: number) => {
    setRating(stars);
    onRate?.(stars);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>你嘅錄音 vs 示範</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={playRecording}
        disabled={playing}
        accessibilityLabel={playing ? '播緊錄音' : '播返你嘅答案'}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>{playing ? '▶ 播緊...' : '▶ 播返你嘅答案'}</Text>
      </TouchableOpacity>

      <View style={styles.modelBox}>
        <Text style={styles.modelLabel}>示範答案：</Text>
        <Text style={styles.modelText}>「{modelAnswer}」</Text>
      </View>

      <Text style={styles.rateLabel}>你覺得自己答得點？</Text>
      <View style={styles.stars}>
        {[1, 2, 3].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.star, rating === s && styles.starActive]}
            onPress={() => handleRate(s)}
            accessibilityLabel={`${s} 星：${STAR_LABELS[s]}`}
            accessibilityRole="button"
          >
            <Text style={styles.starText}>{'⭐'.repeat(s)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && <Text style={styles.rateResult}>{STAR_LABELS[rating]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  label: { color: '#888', fontSize: 13, marginBottom: 10 },
  btn: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12,
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#333',
  },
  btnText: { color: '#a8d8ea', fontSize: 14, fontWeight: '600' },
  modelBox: { backgroundColor: '#16213e', borderRadius: 10, padding: 12, marginBottom: 12 },
  modelLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  modelText: { color: '#4ade80', fontSize: 15, lineHeight: 22 },
  rateLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  star: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#333' },
  starActive: { borderColor: '#f0c040', backgroundColor: '#2a2a0e' },
  starText: { fontSize: 14 },
  rateResult: { color: '#f0c040', fontSize: 13, fontWeight: '600' },
});
