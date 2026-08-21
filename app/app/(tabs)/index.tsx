import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { practices, missions, realRewards } from '../../src/data';
import { getLevel, getNextLevel, useProgress } from '../../src/progress';
import { Card, Eyebrow, Pill, PrimaryButton, ProgressBar, Screen, Title } from '../../src/ui';
import { colors } from '../../src/theme';

const ONBOARDING_KEY = 'hoi-hau-onboarding-v1';

export default function TodayScreen() {
  const { xp, streak, lastPractice, completedMissions, completedPractices } = useProgress();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => setShowWelcome(!value)).catch(() => {});
  }, []);

  const todayDone = lastPractice === new Date().toDateString();
  const practice = practices[new Date().getDate() % practices.length] ?? practices[0]!;
  const level = getLevel(xp);
  const next = getNextLevel(xp);
  const progress = next ? ((xp - level.at) / (next.at - level.at)) * 100 : 100;
  const nextMission = useMemo(
    () => missions.find((mission) => !completedMissions.includes(mission.id)),
    [completedMissions],
  );
  const nextReward = realRewards.find((reward) => xp < reward.xp) ?? realRewards[realRewards.length - 1]!;

  const finishWelcome = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'done').catch(() => {});
    setShowWelcome(false);
  };

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <Eyebrow>開口啦 · 今日訓練</Eyebrow>
          <Title>{todayDone ? '你今日開咗聲！' : '今日，講多一句。'}</Title>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{level.emoji}</Text></View>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.miniCard}>
          <Text style={styles.miniEmoji}>🔥</Text>
          <Text style={styles.miniValue}>{streak}</Text>
          <Text style={styles.miniLabel}>連續日數</Text>
        </Card>
        <Card style={styles.miniCard}>
          <Text style={styles.miniEmoji}>✦</Text>
          <Text style={styles.miniValue}>{xp}</Text>
          <Text style={styles.miniLabel}>信心值</Text>
        </Card>
        <Card style={styles.miniCard}>
          <Text style={styles.miniEmoji}>✓</Text>
          <Text style={styles.miniValue}>{completedPractices.length}</Text>
          <Text style={styles.miniLabel}>練習場景</Text>
        </Card>
      </View>

      <Card style={styles.dailyCard}>
        <View style={styles.cardTop}>
          <Pill tone={todayDone ? 'mint' : 'coral'}>{todayDone ? '今日已完成' : '每日一局 · 約 2 分鐘'}</Pill>
          <Text style={styles.place}>{practice.emoji} {practice.place}</Text>
        </View>
        <Text style={styles.dailyTitle}>由兩個字，升級做一句話</Text>
        <Text style={styles.prompt}>對方問你：{practice.prompt}</Text>
        <View style={styles.formula}>
          <Text style={styles.formulaSmall}>今日句式</Text>
          <Text style={styles.formulaText}>回應 ＋ 想法／原因</Text>
        </View>
        <PrimaryButton
          label={todayDone ? '再練一次' : '開始今日練習'}
          onPress={() => router.push('/arena')}
        />
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>下一份真實獎賞</Text>
        <Text style={styles.sectionMeta}>{nextReward.value}</Text>
      </View>
      <Pressable onPress={() => router.push('/stats')} accessibilityRole="button" accessibilityLabel={`查看獎賞：${nextReward.name}`}>
        <Card style={styles.prizeCard}>
          <View style={styles.prizeEmoji}><Text style={styles.prizeEmojiText}>{nextReward.emoji}</Text></View>
          <View style={styles.prizeBody}>
            <Text style={styles.prizeName}>{nextReward.name}</Text>
            <Text style={styles.prizeCopy}>{xp >= nextReward.xp ? '已達標，可以領獎' : `仲差 ${nextReward.xp - xp} 信心值`}</Text>
            <ProgressBar value={(xp / nextReward.xp) * 100} color={colors.gold} />
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>你嘅成長</Text>
        <Text style={styles.sectionMeta}>{level.name}</Text>
      </View>
      <Card>
        <View style={styles.levelRow}>
          <Text style={styles.levelEmoji}>{level.emoji}</Text>
          <View style={styles.levelBody}>
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.levelCopy}>
              {next ? `仲差 ${next.at - xp} 信心值升做「${next.name}」` : '你已經行得好遠，繼續保持！'}
            </Text>
            <ProgressBar value={progress} />
          </View>
        </View>
      </Card>

      {nextMission && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>下一個出街任務</Text>
            <Text style={styles.sectionMeta}>第 {nextMission.phase} 階段</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`前往任務：${nextMission.title}`}
            onPress={() => router.push('/street')}
          >
            <Card style={styles.missionCard}>
              <View style={styles.missionNumber}><Text style={styles.missionNumberText}>＋</Text></View>
              <View style={styles.missionBody}>
                <Text style={styles.missionTitle}>{nextMission.title}</Text>
                <Text style={styles.missionCopy}>{nextMission.instruction}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Card>
          </Pressable>
        </>
      )}

      <Modal visible={showWelcome} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.welcome}>
            <View style={styles.welcomeArt}>
              <Text style={styles.welcomeEmoji}>{welcomeStep === 0 ? '👋' : '🌱'}</Text>
            </View>
            <Eyebrow>{welcomeStep === 0 ? '歡迎你' : '你話事'}</Eyebrow>
            <Text style={styles.welcomeTitle}>
              {welcomeStep === 0 ? '唔使突然變健談。' : '細細步，都算進步。'}
            </Text>
            <Text style={styles.welcomeCopy}>
              {welcomeStep === 0
                ? '我哋由你最熟悉嘅「哦、好、係」開始，每次只加少少，慢慢砌成完整句子。'
                : '緊張時可以睇提示、照讀，甚至跳過。練習冇人評分，完成一次就值得記低。'}
            </Text>
            <PrimaryButton
              label={welcomeStep === 0 ? '明白，下一步' : '開始第一小步'}
              onPress={() => welcomeStep === 0 ? setWelcomeStep(1) : finishWelcome()}
            />
            {welcomeStep === 1 && (
              <Pressable onPress={() => setWelcomeStep(0)} style={styles.backButton}>
                <Text style={styles.backText}>返回</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  avatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  avatarText: { fontSize: 27 },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 16 },
  miniCard: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 18 },
  miniEmoji: { fontSize: 16, marginBottom: 3 },
  miniValue: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  miniLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 1 },
  dailyCard: { backgroundColor: colors.navy, borderColor: colors.navy, padding: 20 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  place: { color: colors.white, fontSize: 13, fontWeight: '800' },
  dailyTitle: { color: colors.white, fontSize: 24, lineHeight: 31, fontWeight: '900', marginBottom: 8 },
  prompt: { color: '#DDE6F4', fontSize: 15, lineHeight: 23 },
  formula: { backgroundColor: '#2C4A78', borderRadius: 15, padding: 13, marginVertical: 17 },
  formulaSmall: { color: '#ABC4E5', fontSize: 10, fontWeight: '800', marginBottom: 3 },
  formulaText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 10 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelEmoji: { fontSize: 34, marginRight: 14 },
  levelBody: { flex: 1 },
  levelName: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  levelCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginVertical: 5 },
  missionCard: { flexDirection: 'row', alignItems: 'center', shadowOpacity: 0 },
  missionNumber: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  missionNumberText: { color: colors.success, fontSize: 22, fontWeight: '700' },
  missionBody: { flex: 1, marginLeft: 12 },
  missionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  missionCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  chevron: { color: colors.coral, fontSize: 28, marginLeft: 6 },
  prizeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E6', borderColor: '#EAD7A2', shadowOpacity: 0 },
  prizeEmoji: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  prizeEmojiText: { fontSize: 25 },
  prizeBody: { flex: 1, marginLeft: 12 },
  prizeName: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  prizeCopy: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 3, marginBottom: 7 },
  overlay: { flex: 1, backgroundColor: 'rgba(22,35,59,0.62)', justifyContent: 'center', padding: 24 },
  welcome: { backgroundColor: colors.paper, borderRadius: 28, padding: 24 },
  welcomeArt: { height: 118, borderRadius: 22, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  welcomeEmoji: { fontSize: 58 },
  welcomeTitle: { color: colors.ink, fontSize: 27, lineHeight: 35, fontWeight: '900', marginTop: 3 },
  welcomeCopy: { color: colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10, marginBottom: 22 },
  backButton: { alignItems: 'center', paddingTop: 15 },
  backText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
});
