import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { levels, missions, practices, quickPrompts, realRewards, type RealReward } from '../../src/data';
import { getLevel, getNextLevel, useProgress } from '../../src/progress';
import { Card, Eyebrow, Pill, PrimaryButton, ProgressBar, Screen, Title } from '../../src/ui';
import { colors } from '../../src/theme';

export default function JourneyScreen() {
  const {
    xp,
    streak,
    lastPractice,
    completedMissions,
    completedPractices,
    quickResponses,
    claimedRewards,
    sessionHistory,
    claimReward,
    reset,
  } = useProgress();
  const [selectedReward, setSelectedReward] = useState<RealReward | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const level = getLevel(xp);
  const next = getNextLevel(xp);
  const levelPct = next ? ((xp - level.at) / (next.at - level.at)) * 100 : 100;
  const totalActions = completedMissions.length + completedPractices.length + quickResponses.length;
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const practicedToday = lastPractice === new Date().toDateString();
  const completedSessions = sessionHistory.filter((session) => session.status === 'completed');
  const voiceSessions = sessionHistory.filter((session) => session.mode === 'voice');
  const completionRate = sessionHistory.length ? Math.round((completedSessions.length / sessionHistory.length) * 100) : 0;
  const averageDuration = voiceSessions.length ? voiceSessions.reduce((sum, session) => sum + session.duration, 0) / voiceSessions.length : 0;
  const scoredVoiceSessions = voiceSessions.filter((session) => session.voiceScore !== null);
  const averageVoiceScore = scoredVoiceSessions.length
    ? Math.round(scoredVoiceSessions.reduce((sum, session) => sum + (session.voiceScore ?? 0), 0) / scoredVoiceSessions.length)
    : 0;
  const meaningfulSessions = completedSessions.filter((session) => {
    const length = session.transcript.replace(/\s/g, '').length;
    return length >= Math.max(4, session.targetChars * 0.7) && (session.mode === 'text' || session.duration >= 1.5);
  }).length;
  const effortLabel = sessionHistory.length < 2 ? '資料累積中' : completionRate >= 75 && meaningfulSessions >= 2 ? '穩定投入' : completionRate >= 45 ? '開始建立習慣' : '較多未完成練習';
  const visibleHistory = showAllHistory ? sessionHistory : sessionHistory.slice(0, 5);

  const confirmReset = () => {
    Alert.alert('重新開始進度？', '信心值、任務同連續日數會重設；練習歷史同領獎紀錄會保留作核對。', [
      { text: '取消', style: 'cancel' },
      { text: '重新開始', style: 'destructive', onPress: () => reset() },
    ]);
  };

  const claimSelectedReward = () => {
    if (!selectedReward) return;
    const code = claimReward(selectedReward.id, selectedReward.xp);
    if (!code) return;
    Alert.alert('領獎資格已確認', `你嘅領獎碼係 ${code}\n\n請向活動負責人出示呢個畫面。`);
    setSelectedReward(null);
  };

  const achievements = [
    { emoji: '🌱', name: '第一句', copy: '完成第一次完整句練習', unlocked: completedPractices.length >= 1 },
    { emoji: '⚡', name: '快反應', copy: '完成 3 次十五秒快練', unlocked: quickResponses.length >= 3 },
    { emoji: '👋', name: '踏出一步', copy: '完成第一個出街任務', unlocked: completedMissions.length >= 1 },
    { emoji: '🔥', name: '有恆心', copy: '連續練習 3 日', unlocked: streak >= 3 },
  ];

  return (
    <Screen>
      <Eyebrow>你嘅成長旅程</Eyebrow>
      <Title>每一句，都有計。</Title>
      <Text style={styles.intro}>唔同自己比較快慢，只睇你由「唔想講」行到今日有幾遠。</Text>

      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.levelAvatar}><Text style={styles.levelEmoji}>{level.emoji}</Text></View>
          <View style={styles.heroBody}>
            <Text style={styles.levelLabel}>目前階段</Text>
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.levelMeta}>{xp} 信心值</Text>
          </View>
        </View>
        <ProgressBar value={levelPct} color={colors.gold} />
        <Text style={styles.nextText}>
          {next ? `下一階段：${next.name} · 仲差 ${next.at - xp}` : '你已經去到最高階段，繼續享受對話。'}
        </Text>
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>真實獎賞</Text>
          <Text style={styles.rewardSectionCopy}>儲信心值，換領真正用得到嘅禮物</Text>
        </View>
        <Pill tone="coral">限量換領</Pill>
      </View>
      {realRewards.map((reward) => {
        const unlocked = xp >= reward.xp;
        const code = claimedRewards[reward.id];
        return (
          <Pressable
            key={reward.id}
            disabled={!unlocked}
            onPress={() => setSelectedReward(reward)}
            accessibilityRole="button"
            accessibilityLabel={`${reward.name}，${unlocked ? code ? '已領取' : '可以領取' : `仲差 ${reward.xp - xp} 信心值`}`}
          >
            <Card style={[styles.realReward, !unlocked && styles.realRewardLocked, Boolean(code) && styles.realRewardClaimed]}>
              <View style={styles.rewardEmojiBox}><Text style={styles.rewardEmoji}>{reward.emoji}</Text></View>
              <View style={styles.realRewardBody}>
                <View style={styles.realRewardTop}>
                  <Text style={styles.realRewardName}>{reward.name}</Text>
                  <Text style={styles.realRewardValue}>{reward.value}</Text>
                </View>
                <Text style={styles.realRewardStatus}>
                  {code ? `已登記 · ${code}` : unlocked ? '已達標 · 撳入去領獎' : `${reward.xp} 信心值解鎖 · 仲差 ${reward.xp - xp}`}
                </Text>
                {!unlocked && <ProgressBar value={(xp / reward.xp) * 100} color={colors.gold} />}
              </View>
            </Card>
          </Pressable>
        );
      })}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>今個星期</Text>
        <Text style={styles.streak}>🔥 {streak} 日連續</Text>
      </View>
      <Card style={styles.weekCard}>
        <View style={styles.weekRow}>
          {days.map((day, index) => {
            const isToday = index === todayIndex;
            const active = isToday && practicedToday;
            return (
              <View key={day} style={styles.day}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day}</Text>
                <View style={[styles.dayDot, active && styles.dayDotActive, isToday && !active && styles.dayDotToday]}>
                  <Text style={[styles.dayMark, active && styles.dayMarkActive]}>{active ? '✓' : '·'}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text style={styles.weekNote}>{practicedToday ? '今日嗰一步已經完成。' : '今日未練；做一個 15 秒快練都計。'}</Text>
      </Card>

      <View style={styles.summary}>
        <Card style={styles.summaryCard}><Text style={styles.summaryValue}>{completedPractices.length}/{practices.length}</Text><Text style={styles.summaryLabel}>場景練習</Text></Card>
        <Card style={styles.summaryCard}><Text style={styles.summaryValue}>{completedMissions.length}/{missions.length}</Text><Text style={styles.summaryLabel}>出街任務</Text></Card>
        <Card style={styles.summaryCard}><Text style={styles.summaryValue}>{quickResponses.length}/{quickPrompts.length}</Text><Text style={styles.summaryLabel}>快速回應</Text></Card>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>練習投入紀錄</Text>
          <Text style={styles.historySectionCopy}>每次開始、完成、逐字稿同分數都會保留</Text>
        </View>
        <Pill tone={completionRate >= 75 ? 'mint' : 'sky'}>{effortLabel}</Pill>
      </View>
      <Card style={styles.auditCard}>
        <View style={styles.auditGrid}>
          <View style={styles.auditMetric}><Text style={styles.auditValue}>{sessionHistory.length}</Text><Text style={styles.auditLabel}>總嘗試</Text></View>
          <View style={styles.auditMetric}><Text style={styles.auditValue}>{completionRate}%</Text><Text style={styles.auditLabel}>完成率</Text></View>
          <View style={styles.auditMetric}><Text style={styles.auditValue}>{meaningfulSessions}</Text><Text style={styles.auditLabel}>有效練習</Text></View>
          <View style={styles.auditMetric}><Text style={styles.auditValue}>{averageDuration.toFixed(1)}s</Text><Text style={styles.auditLabel}>平均開聲</Text></View>
          <View style={styles.auditMetric}><Text style={styles.auditValue}>{averageVoiceScore || '—'}</Text><Text style={styles.auditLabel}>平均語氣分</Text></View>
        </View>
        <Text style={styles.auditNote}>「投入度」只反映使用次數、完成率、句子長度同開聲時間，唔係對使用者性格或努力嘅判斷。</Text>
      </Card>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>全部練習歷史</Text>
        <Text style={styles.historyCount}>{sessionHistory.length} 節</Text>
      </View>
      {visibleHistory.length === 0 ? (
        <Card style={styles.emptyHistory}>
          <Text style={styles.emptyHistoryTitle}>未有練習紀錄</Text>
          <Text style={styles.emptyHistoryText}>一撳語音練習或者文字分析，第一節紀錄就會出現。</Text>
        </Card>
      ) : visibleHistory.map((session) => (
        <Card key={session.id} style={[styles.historyCard, session.status === 'in_progress' && styles.historyIncomplete]}>
          <View style={styles.historyTop}>
            <View style={styles.historyBadges}>
              <Pill tone={session.status === 'completed' ? 'mint' : 'coral'}>{session.status === 'completed' ? '已完成' : '未完成'}</Pill>
              <Text style={styles.historyDifficulty}>第 {session.difficulty} 級 · {session.difficultyName}</Text>
            </View>
            <Text style={styles.historyDate}>{new Date(session.startedAt).toLocaleString('zh-HK', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <Text style={styles.historyPlace}>{session.mode === 'voice' ? '🎙️' : '⌨️'} {session.place} · {session.requirement}</Text>
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptHistoryLabel}>逐字稿</Text>
            <Text style={styles.transcriptHistoryText}>{session.transcript || '未有內容（可能喺開聲前離開）'}</Text>
          </View>
          <View style={styles.sessionMetrics}>
            <Text style={styles.sessionMetric}>⏱ {session.duration.toFixed(1)} 秒</Text>
            <Text style={styles.sessionMetric}>語氣 {session.voiceScore ?? '—'}</Text>
            <Text style={styles.sessionMetric}>內容 {session.contentScore ?? '—'}</Text>
            <Text style={styles.sessionMetric}>{session.transcript.replace(/\s/g, '').length}/{session.targetChars} 字</Text>
          </View>
        </Card>
      ))}
      {sessionHistory.length > 5 && (
        <Pressable onPress={() => setShowAllHistory((value) => !value)} style={styles.showAllHistory}>
          <Text style={styles.showAllHistoryText}>{showAllHistory ? '收起較舊紀錄' : `查看全部 ${sessionHistory.length} 節紀錄`}</Text>
        </Pressable>
      )}
      <Card style={styles.localPrivacy}>
        <Text style={styles.localPrivacyText}>🔒 歷史目前只儲存在呢部裝置。任何可以使用呢部裝置嘅人都可以喺「旅程」查看；資料唔會自動上載。</Text>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>成就貼紙</Text>
        <Text style={styles.sectionMeta}>{achievements.filter((item) => item.unlocked).length}/{achievements.length}</Text>
      </View>
      <View style={styles.badges}>
        {achievements.map((item) => (
          <Card key={item.name} style={[styles.badge, !item.unlocked && styles.badgeLocked]}>
            <Text style={styles.badgeEmoji}>{item.unlocked ? item.emoji : '○'}</Text>
            <Text style={[styles.badgeName, !item.unlocked && styles.muted]}>{item.name}</Text>
            <Text style={[styles.badgeCopy, !item.unlocked && styles.muted]}>{item.copy}</Text>
          </Card>
        ))}
      </View>

      {totalActions === 0 && (
        <Card style={styles.empty}>
          <Text style={styles.emptyTitle}>你嘅第一步仲喺前面。</Text>
          <Text style={styles.emptyCopy}>唔使等到有信心先開始——信心係每次細小嘗試之後慢慢生出嚟。</Text>
        </Card>
      )}

      <View style={styles.road}>
        {levels.map((item, index) => (
          <View key={item.name} style={styles.roadItem}>
            <View style={[styles.roadDot, xp >= item.at && styles.roadDotActive]}><Text>{item.emoji}</Text></View>
            <View style={styles.roadBody}>
              <Text style={[styles.roadName, xp < item.at && styles.muted]}>{item.name}</Text>
              <Text style={styles.roadAt}>{item.at} 信心值</Text>
            </View>
            {index < levels.length - 1 && <View style={[styles.roadLine, xp >= levels[index + 1]!.at && styles.roadLineActive]} />}
          </View>
        ))}
      </View>

      <Pressable onPress={confirmReset} style={styles.reset}>
        <Text style={styles.resetText}>重設進度（保留練習歷史）</Text>
      </Pressable>

      <Modal visible={selectedReward !== null} transparent animationType="slide" onRequestClose={() => setSelectedReward(null)}>
        <View style={styles.rewardOverlay}>
          <View style={styles.rewardSheet}>
            <View style={styles.rewardHandle} />
            <Text style={styles.rewardSheetEmoji}>{selectedReward?.emoji}</Text>
            <Eyebrow>你已經達標</Eyebrow>
            <Text style={styles.rewardSheetTitle}>{selectedReward?.name}</Text>
            <Text style={styles.rewardSheetValue}>{selectedReward?.value}</Text>
            <Text style={styles.rewardDescription}>{selectedReward?.description}</Text>
            <Card style={styles.fulfilmentCard}>
              <Text style={styles.fulfilmentLabel}>點樣拎到實物？</Text>
              <Text style={styles.fulfilmentText}>{selectedReward?.fulfilment}</Text>
            </Card>
            {selectedReward && claimedRewards[selectedReward.id] ? (
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>你嘅領獎碼</Text>
                <Text style={styles.codeText}>{claimedRewards[selectedReward.id]}</Text>
                <Text style={styles.codeNote}>出示呢個畫面畀活動負責人核對</Text>
              </View>
            ) : (
              <PrimaryButton label="確認領取，產生領獎碼" onPress={claimSelectedReward} />
            )}
            <Pressable onPress={() => setSelectedReward(null)} style={styles.rewardClose}><Text style={styles.rewardCloseText}>遲啲先</Text></Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 7, marginBottom: 18 },
  hero: { backgroundColor: colors.navy, borderColor: colors.navy },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  levelAvatar: { width: 65, height: 65, borderRadius: 21, backgroundColor: '#2D4D7B', alignItems: 'center', justifyContent: 'center' },
  levelEmoji: { fontSize: 34 },
  heroBody: { marginLeft: 14 },
  levelLabel: { color: '#B8CDE6', fontSize: 10, fontWeight: '800' },
  levelName: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 2 },
  levelMeta: { color: colors.gold, fontSize: 12, fontWeight: '900', marginTop: 3 },
  nextText: { color: '#C5D3E5', fontSize: 10, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 10 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  streak: { color: colors.coral, fontSize: 12, fontWeight: '900' },
  weekCard: { shadowOpacity: 0 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center' },
  dayLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginBottom: 8 },
  dayLabelToday: { color: colors.coral },
  dayDot: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  dayDotToday: { borderWidth: 1, borderColor: colors.coral },
  dayDotActive: { backgroundColor: colors.coral },
  dayMark: { color: '#B0AAA0', fontSize: 17 },
  dayMarkActive: { color: colors.white, fontWeight: '900' },
  weekNote: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 14 },
  summary: { flexDirection: 'row', gap: 8, marginTop: 14 },
  summaryCard: { flex: 1, borderRadius: 17, padding: 12, alignItems: 'center', shadowOpacity: 0 },
  summaryValue: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  summaryLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 3 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: '48.5%', padding: 15, shadowOpacity: 0 },
  badgeLocked: { backgroundColor: '#F1EDE5', opacity: 0.65 },
  badgeEmoji: { fontSize: 28, marginBottom: 7 },
  badgeName: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  badgeCopy: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  muted: { color: '#9A9CA2' },
  empty: { backgroundColor: colors.sky, borderColor: '#C8DEE7', marginTop: 18, shadowOpacity: 0 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 4 },
  road: { marginTop: 28, marginLeft: 8 },
  roadItem: { flexDirection: 'row', minHeight: 72, position: 'relative' },
  roadDot: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#ECE7DE', alignItems: 'center', justifyContent: 'center', opacity: 0.5, zIndex: 2 },
  roadDotActive: { backgroundColor: colors.mint, opacity: 1 },
  roadBody: { marginLeft: 12, paddingTop: 3 },
  roadName: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  roadAt: { color: colors.muted, fontSize: 10, marginTop: 3 },
  roadLine: { position: 'absolute', left: 20, top: 42, width: 2, height: 30, backgroundColor: colors.line },
  roadLineActive: { backgroundColor: colors.success },
  reset: { alignItems: 'center', padding: 18, marginTop: 4 },
  resetText: { color: colors.muted, fontSize: 11, textDecorationLine: 'underline' },
  historySectionCopy: { color: colors.muted, fontSize: 10, marginTop: 3 },
  auditCard: { backgroundColor: colors.navy, borderColor: colors.navy, shadowOpacity: 0 },
  auditGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  auditMetric: { width: '20%', alignItems: 'center' },
  auditValue: { color: colors.white, fontSize: 18, fontWeight: '900' },
  auditLabel: { color: '#BFD0E8', fontSize: 8, fontWeight: '700', marginTop: 3, textAlign: 'center' },
  auditNote: { color: '#BFD0E8', fontSize: 9, lineHeight: 14, borderTopWidth: 1, borderTopColor: '#35527D', paddingTop: 11, marginTop: 13 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 9 },
  historyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  historyCount: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  emptyHistory: { backgroundColor: colors.sky, borderColor: '#C8DEE7', shadowOpacity: 0 },
  emptyHistoryTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  emptyHistoryText: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 3 },
  historyCard: { marginBottom: 9, padding: 14, shadowOpacity: 0 },
  historyIncomplete: { borderColor: '#F2B29F', backgroundColor: '#FFF8F4' },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  historyBadges: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  historyDifficulty: { color: colors.navy, fontSize: 10, fontWeight: '900' },
  historyDate: { color: colors.muted, fontSize: 9 },
  historyPlace: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 9 },
  transcriptBox: { backgroundColor: colors.cream, borderRadius: 12, padding: 10, marginTop: 9 },
  transcriptHistoryLabel: { color: colors.muted, fontSize: 8, fontWeight: '900' },
  transcriptHistoryText: { color: colors.ink, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 3 },
  sessionMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 9 },
  sessionMetric: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  showAllHistory: { alignItems: 'center', padding: 12 },
  showAllHistoryText: { color: colors.navy, fontSize: 11, fontWeight: '900', textDecorationLine: 'underline' },
  localPrivacy: { backgroundColor: colors.mint, borderColor: '#C9DDC9', shadowOpacity: 0, padding: 12, marginTop: 3 },
  localPrivacyText: { color: colors.ink, fontSize: 9, lineHeight: 15 },
  rewardSectionCopy: { color: colors.muted, fontSize: 10, marginTop: 3 },
  realReward: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 9, shadowOpacity: 0 },
  realRewardLocked: { opacity: 0.58, backgroundColor: '#F1EDE5' },
  realRewardClaimed: { backgroundColor: '#F0F7F0', borderColor: '#C9DDC9' },
  rewardEmojiBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  rewardEmoji: { fontSize: 25 },
  realRewardBody: { flex: 1, marginLeft: 12 },
  realRewardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  realRewardName: { color: colors.ink, fontSize: 14, fontWeight: '900', flex: 1 },
  realRewardValue: { color: colors.coral, fontSize: 10, fontWeight: '900' },
  realRewardStatus: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 5, marginBottom: 7 },
  rewardOverlay: { flex: 1, backgroundColor: 'rgba(22,35,59,0.58)', justifyContent: 'flex-end' },
  rewardSheet: { backgroundColor: colors.paper, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 34 },
  rewardHandle: { width: 42, height: 5, borderRadius: 5, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 16 },
  rewardSheetEmoji: { fontSize: 52, marginBottom: 12 },
  rewardSheetTitle: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 4 },
  rewardSheetValue: { color: colors.coral, fontSize: 14, fontWeight: '900', marginTop: 3 },
  rewardDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 10 },
  fulfilmentCard: { backgroundColor: colors.sky, borderColor: '#C8DEE7', shadowOpacity: 0, marginVertical: 15 },
  fulfilmentLabel: { color: colors.navy, fontSize: 10, fontWeight: '900' },
  fulfilmentText: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 4 },
  codeBox: { backgroundColor: colors.navy, borderRadius: 20, padding: 18, alignItems: 'center' },
  codeLabel: { color: '#BFD0E8', fontSize: 10, fontWeight: '800' },
  codeText: { color: colors.white, fontSize: 24, fontWeight: '900', letterSpacing: 1.5, marginVertical: 7 },
  codeNote: { color: '#BFD0E8', fontSize: 10 },
  rewardClose: { alignItems: 'center', paddingTop: 15 },
  rewardCloseText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
