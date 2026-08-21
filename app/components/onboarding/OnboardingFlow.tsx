import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions,
} from 'react-native';

const SLIDES = [
  {
    emoji: '😶',
    title: '你好，我知你係點㗎',
    body: '同人講嘢會緊張？\n開口難？回覆只係「OK」「哦」「係」？\n\n呢個 App 係專門為你設計嘅。',
  },
  {
    emoji: '⚔️',
    title: '講嘢係可以練㗎',
    body: '就好似打 Brawl Stars 一樣——\n每場 60 秒，每次完成都有獎勵。\n\n唔係上堂，係玩遊戲。',
  },
  {
    emoji: '🗺️',
    title: '由最細步開始',
    body: '第一步唔係演講。\n係同收銀員有眼神接觸。\n\n每一個細步都係真實嘅進步。',
  },
  {
    emoji: '🏆',
    title: '準備好未？',
    body: '賺取口杯 → 升級角色 → 解鎖新挑戰\n\n你嘅第一個任務等緊你。',
  },
];

interface Props {
  onDone: () => void;
}

export function OnboardingFlow({ onDone }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const advance = () => {
    if (index < SLIDES.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      onDone();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={advance}
          accessibilityRole="button"
          accessibilityLabel={index < SLIDES.length - 1 ? `繼續至第 ${index + 2} 頁` : '開始訓練'}
        >
          <Text style={styles.btnText}>
            {index < SLIDES.length - 1 ? '繼續 →' : '開始訓練 ⚔️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e17' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  body: { color: '#ccc', fontSize: 17, lineHeight: 28, textAlign: 'center' },
  footer: { paddingHorizontal: 32, paddingBottom: 48 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#e94560', width: 24 },
  btn: { backgroundColor: '#e94560', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
