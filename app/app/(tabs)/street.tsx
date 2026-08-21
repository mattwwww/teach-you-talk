import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { missions, type Mission } from '../../src/data';
import { useProgress } from '../../src/progress';
import { Card, Eyebrow, Pill, PrimaryButton, ProgressBar, Screen, Title } from '../../src/ui';
import { colors } from '../../src/theme';

export default function StreetScreen() {
  const completed = useProgress((state) => state.completedMissions);
  const finishMission = useProgress((state) => state.finishMission);
  const [active, setActive] = useState<Mission | null>(null);
  const [reflection, setReflection] = useState('');
  const progress = (completed.length / missions.length) * 100;
  const unlockedPhase = completed.filter((id) => missions.find((mission) => mission.id === id)?.phase === 1).length >= 2
    ? completed.filter((id) => missions.find((mission) => mission.id === id)?.phase === 2).length >= 2 ? 3 : 2
    : 1;
  const phases = useMemo(() => [1, 2, 3], []);

  const completeActive = () => {
    if (!active) return;
    finishMission(active.id, active.xp);
    setActive(null);
    setReflection('');
  };

  return (
    <Screen>
      <Eyebrow>現實世界 · 慢慢嚟</Eyebrow>
      <Title>出街小任務</Title>
      <Text style={styles.intro}>唔係挑戰膽量，而係畀個腦累積「我做得到」嘅小證據。任何時候都可以跳過。</Text>

      <Card style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View>
            <Text style={styles.progressLabel}>你嘅小步紀錄</Text>
            <Text style={styles.progressValue}>{completed.length} / {missions.length}</Text>
          </View>
          <View style={styles.foot}><Text style={styles.footEmoji}>👣</Text></View>
        </View>
        <ProgressBar value={progress} color={colors.success} />
      </Card>

      {phases.map((phase) => {
        const locked = phase > unlockedPhase;
        const phaseMissions = missions.filter((mission) => mission.phase === phase);
        const doneCount = phaseMissions.filter((mission) => completed.includes(mission.id)).length;
        return (
          <View key={phase} style={styles.phase}>
            <View style={styles.phaseHeader}>
              <View>
                <Text style={[styles.phaseName, locked && styles.muted]}>
                  {phase === 1 ? '第一階段 · 俾人見到你' : phase === 2 ? '第二階段 · 講一個完整需要' : '第三階段 · 有來有往'}
                </Text>
                <Text style={styles.phaseCopy}>
                  {locked ? '完成上一階段後開啟' : `${doneCount}/${phaseMissions.length} 已完成`}
                </Text>
              </View>
              <Pill tone={doneCount === phaseMissions.length ? 'mint' : 'sky'}>
                {locked ? '🔒' : doneCount === phaseMissions.length ? '完成' : `第 ${phase} 關`}
              </Pill>
            </View>

            {phaseMissions.map((mission, index) => {
              const done = completed.includes(mission.id);
              return (
                <Pressable
                  key={mission.id}
                  disabled={locked || done}
                  accessibilityRole="button"
                  accessibilityLabel={locked ? `${mission.title}，未開啟` : done ? `${mission.title}，已完成` : mission.title}
                  onPress={() => setActive(mission)}
                  style={({ pressed }) => pressed && !locked && !done ? styles.pressed : undefined}
                >
                  <Card style={[styles.mission, locked && styles.locked, done && styles.completed]}>
                    <View style={[styles.number, done && styles.numberDone]}>
                      <Text style={[styles.numberText, done && styles.numberTextDone]}>{done ? '✓' : index + 1}</Text>
                    </View>
                    <View style={styles.missionBody}>
                      <Text style={[styles.missionTitle, locked && styles.muted]}>{mission.title}</Text>
                      <Text style={[styles.missionText, locked && styles.muted]}>{mission.instruction}</Text>
                      {!locked && !done && <Text style={styles.reward}>完成 ＋{mission.xp} 信心值</Text>}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      <Card style={styles.safetyCard}>
        <Text style={styles.safetyEmoji}>🫶</Text>
        <View style={styles.safetyBody}>
          <Text style={styles.safetyTitle}>安全永遠行先</Text>
          <Text style={styles.safetyText}>只喺安全、合適嘅場合練習。對方忙緊、你唔舒服，或者環境唔對路，就直接離開。</Text>
        </View>
      </Card>

      <Modal visible={active !== null} transparent animationType="slide" onRequestClose={() => setActive(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Pill tone="coral">出街前先預演</Pill>
            <Text style={styles.sheetTitle}>{active?.title}</Text>
            <Text style={styles.sheetInstruction}>{active?.instruction}</Text>
            <View style={styles.fallback}>
              <Text style={styles.fallbackLabel}>覺得太難？用簡易版</Text>
              <Text style={styles.fallbackText}>{active?.fallback}</Text>
            </View>
            <Text style={styles.reflectLabel}>做完之後，可以留低一句感受（選填）</Text>
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="例如：開頭好緊張，但對方反應好普通。"
              placeholderTextColor="#9A9FA9"
              multiline
              style={styles.reflectInput}
            />
            <PrimaryButton label="我完成咗" onPress={completeActive} />
            <Pressable onPress={() => setActive(null)} style={styles.cancel}>
              <Text style={styles.cancelText}>未係時候，下次先</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 7, marginBottom: 18 },
  progressCard: { backgroundColor: colors.navy, borderColor: colors.navy },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  progressLabel: { color: '#BCD0E9', fontSize: 11, fontWeight: '800' },
  progressValue: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 2 },
  foot: { width: 49, height: 49, borderRadius: 16, backgroundColor: '#2D4D7B', alignItems: 'center', justifyContent: 'center' },
  footEmoji: { fontSize: 24 },
  phase: { marginTop: 27 },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  phaseName: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  phaseCopy: { color: colors.muted, fontSize: 11, marginTop: 3 },
  mission: { flexDirection: 'row', marginBottom: 10, padding: 15, shadowOpacity: 0 },
  locked: { opacity: 0.48, backgroundColor: '#F0ECE4' },
  completed: { backgroundColor: '#F0F7F0', borderColor: '#CDE0CD' },
  number: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center' },
  numberDone: { backgroundColor: colors.success },
  numberText: { color: colors.navy, fontSize: 14, fontWeight: '900' },
  numberTextDone: { color: colors.white },
  missionBody: { flex: 1, marginLeft: 12 },
  missionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  missionText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  reward: { color: colors.coral, fontSize: 10, fontWeight: '900', marginTop: 8 },
  muted: { color: '#9699A0' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  safetyCard: { flexDirection: 'row', marginTop: 24, backgroundColor: colors.coralSoft, borderColor: '#F4CABB', shadowOpacity: 0 },
  safetyEmoji: { fontSize: 25, marginRight: 11 },
  safetyBody: { flex: 1 },
  safetyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  safetyText: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 3 },
  overlay: { flex: 1, backgroundColor: 'rgba(22,35,59,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, paddingBottom: 36 },
  handle: { width: 42, height: 5, borderRadius: 4, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { color: colors.ink, fontSize: 26, lineHeight: 34, fontWeight: '900', marginTop: 13 },
  sheetInstruction: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 7 },
  fallback: { backgroundColor: colors.sky, borderRadius: 16, padding: 13, marginVertical: 15 },
  fallbackLabel: { color: colors.navy, fontSize: 10, fontWeight: '900' },
  fallbackText: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 3 },
  reflectLabel: { color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 7 },
  reflectInput: { minHeight: 75, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 12, color: colors.ink, fontSize: 13, textAlignVertical: 'top', marginBottom: 14 },
  cancel: { alignItems: 'center', paddingTop: 15 },
  cancelText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
