import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { quickPrompts } from '../../src/data';
import { useProgress } from '../../src/progress';
import { colors } from '../../src/theme';

export default function QuickPracticeScreen() {
  const { height } = useWindowDimensions();
  const pageHeight = Math.max(560, height - 150);
  const [revealed, setRevealed] = useState<string[]>([]);
  const quickResponses = useProgress((state) => state.quickResponses);
  const finishQuick = useProgress((state) => state.finishQuick);

  const toggleReveal = (id: string) => {
    setRevealed((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>15 秒快練</Text>
          <Text style={styles.title}>望一句，講一句。</Text>
        </View>
        <Text style={styles.swipe}>向上掃 ↑</Text>
      </View>
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={pageHeight}
        decelerationRate="fast"
      >
        {quickPrompts.map((item, index) => {
          const done = quickResponses.includes(item.id);
          const showExample = revealed.includes(item.id);
          return (
            <View key={item.id} style={[styles.page, { height: pageHeight }]}>
              <View style={[styles.card, index % 2 === 0 ? styles.blueCard : styles.greenCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.counter}><Text style={styles.counterText}>0{index + 1}</Text></View>
                  <Text style={styles.scene}>{item.scene}</Text>
                  {done && <Text style={styles.done}>完成 ✓</Text>}
                </View>
                <View style={styles.illustration}><Text style={styles.emoji}>{item.emoji}</Text></View>
                <Text style={styles.line}>{item.line}</Text>
                <Text style={styles.ask}>{item.ask}</Text>
                {showExample ? (
                  <View style={styles.example}>
                    <Text style={styles.exampleLabel}>可以咁講</Text>
                    <Text style={styles.exampleText}>「{item.example}」</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => toggleReveal(item.id)} style={styles.hintButton}>
                    <Text style={styles.hintText}>卡住咗？睇提示句</Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={done ? '呢題已完成' : '我已經講咗一句'}
                  disabled={done}
                  onPress={() => finishQuick(item.id)}
                  style={({ pressed }) => [styles.speakButton, done && styles.speakButtonDone, pressed && !done && styles.pressed]}
                >
                  <Text style={styles.speakButtonText}>{done ? '已經開咗聲 · ＋5' : '🎙️  我講咗一句'}</Text>
                </Pressable>
                <Text style={styles.note}>喺心入面講都可以；準備好先出聲。</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { height: 76, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cream },
  eyebrow: { color: colors.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 2 },
  swipe: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  page: { paddingHorizontal: 14, paddingBottom: 14 },
  card: { flex: 1, borderRadius: 30, padding: 22, overflow: 'hidden' },
  blueCard: { backgroundColor: '#DCECF2' },
  greenCard: { backgroundColor: '#DFEBDD' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  counter: { backgroundColor: colors.paper, width: 38, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  counterText: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  scene: { color: colors.ink, fontSize: 13, fontWeight: '900', marginLeft: 10 },
  done: { marginLeft: 'auto', color: colors.success, fontSize: 11, fontWeight: '900' },
  illustration: { height: 140, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 76 },
  line: { color: colors.ink, fontSize: 24, lineHeight: 35, fontWeight: '900', textAlign: 'center' },
  ask: { color: colors.navy, fontSize: 15, lineHeight: 23, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  hintButton: { alignItems: 'center', paddingVertical: 18 },
  hintText: { color: colors.navy, fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },
  example: { backgroundColor: 'rgba(255,255,255,0.66)', borderRadius: 16, padding: 13, marginVertical: 15 },
  exampleLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  exampleText: { color: colors.ink, fontSize: 14, lineHeight: 21, fontWeight: '800', marginTop: 3 },
  speakButton: { minHeight: 54, backgroundColor: colors.coral, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  speakButtonDone: { backgroundColor: colors.success },
  speakButtonText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  note: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 10 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});
