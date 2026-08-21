import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { practices } from '../../src/data';
import { useProgress } from '../../src/progress';
import { useVoiceCoach, type VoiceResult } from '../../src/useVoiceCoach';
import { analyseCantoneseResponse, appendFragment } from '../../src/languageCoach';
import { Card, Eyebrow, Pill, PrimaryButton, ProgressBar, Screen, Title } from '../../src/ui';
import { colors } from '../../src/theme';

type Step = 'build' | 'speak' | 'review' | 'language' | 'celebrate';

const difficultyProfiles = [
  { level: 1, name: '完整回應', addChars: 0, requirement: '講清楚你要乜／答乜', bonus: 0 },
  { level: 2, name: '加入想法', addChars: 3, requirement: '回應之外，加自己嘅想法', bonus: 3 },
  { level: 3, name: '解釋原因', addChars: 6, requirement: '加入「因為…」解釋原因', bonus: 6 },
  { level: 4, name: '具體細節', addChars: 10, requirement: '補充時間、地點、數量或做法', bonus: 10 },
  { level: 5, name: '自然對話', addChars: 14, requirement: '想法＋原因＋細節＋自然收尾', bonus: 15 },
] as const;

function difficultyFor(completedSessions: number) {
  return difficultyProfiles[Math.min(difficultyProfiles.length - 1, Math.floor(completedSessions / 2))]!;
}

function sentenceLength(value: string) {
  return value.replace(/[\s，。！？、,.!?「」『』]/g, '').length;
}

function endingText(ending: VoiceResult['ending']) {
  if (ending === 'rising') return '尾音有上揚';
  if (ending === 'falling') return '尾音有落點';
  if (ending === 'steady') return '尾音較平穩';
  return '未收集到足夠音高';
}

function voiceFeedback(result: VoiceResult) {
  const pitch = result.pitchRange;
  if (pitch !== null && pitch < 28) return '語調比較平。試下將重點字講高少少，句尾自然收返落嚟。';
  if (pitch !== null && pitch > 95) return '高低變化好明顯。保持自然，重點字突出就夠。';
  if (result.averageVolume < 0.025) return '聲量比較輕。試下望住前面，將聲送到一個手臂以外。';
  if (result.duration < 2) return '今次比較快。下次喺想法同原因之間停半秒，會更從容。';
  return '聲量同語調都有自然變化，聽落似一個完整、有信心嘅回應。';
}

export default function PracticeScreen() {
  const [step, setStep] = useState<Step>('build');
  const [answer, setAnswer] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedMode, setCompletedMode] = useState<'voice' | 'text'>('voice');
  const [lastEarned, setLastEarned] = useState(20);
  const sound = useRef<Audio.Sound | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const finishPractice = useProgress((state) => state.finishPractice);
  const sessionHistory = useProgress((state) => state.sessionHistory);
  const startPracticeSession = useProgress((state) => state.startPracticeSession);
  const updatePracticeSession = useProgress((state) => state.updatePracticeSession);
  const completedSessionCount = sessionHistory.filter((session) => session.status === 'completed').length;
  const practiceIndex = completedSessionCount % practices.length;
  const voice = useVoiceCoach();
  const practice = practices[practiceIndex] ?? practices[0]!;
  const difficulty = difficultyFor(completedSessionCount);
  const targetChars = practice.target + difficulty.addChars;
  const spokenText = voice.transcript || answer;
  const count = sentenceLength(spokenText);
  const ready = count >= targetChars;
  const languageAnalysis = analyseCantoneseResponse(spokenText, practice);
  const contentScore = Math.round(Math.min(100, 20 + Math.min(35, (count / Math.max(1, targetChars)) * 35) + Math.min(45, languageAnalysis.strengths.length * 12)));
  const earned = 20 + difficulty.bonus + ((voice.result?.score ?? 0) >= 70 ? 5 : 0);

  const ensureSession = (mode: 'voice' | 'text') => {
    if (sessionIdRef.current) {
      updatePracticeSession(sessionIdRef.current, { mode, transcript: spokenText });
      return sessionIdRef.current;
    }
    const id = startPracticeSession({
      practiceId: practice.id,
      place: practice.place,
      difficulty: difficulty.level,
      difficultyName: difficulty.name,
      targetChars,
      requirement: difficulty.requirement,
      mode,
      transcript: spokenText,
    });
    sessionIdRef.current = id;
    return id;
  };

  useEffect(() => {
    if (step !== 'speak' || !voice.active) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [step, voice.active]);

  useEffect(() => () => { sound.current?.unloadAsync().catch(() => {}); }, []);

  const startSpeaking = async () => {
    setSeconds(0);
    voice.reset();
    try {
      await voice.start();
      ensureSession('voice');
      setStep('speak');
    } catch {
      Alert.alert('未能使用咪高峰', '請喺瀏覽器網址列允許咪高峰權限，再試一次。你亦可以繼續用文字練習。');
    }
  };

  const stopSpeaking = async () => {
    const result = await voice.stop();
    if (voice.transcript) setAnswer(voice.transcript);
    const id = ensureSession('voice');
    updatePracticeSession(id, {
      transcript: voice.transcript || answer,
      duration: result.duration,
      voiceScore: result.score,
      contentScore,
    });
    setStep('review');
  };

  const playRecording = async () => {
    if (!voice.audioUri) return;
    await sound.current?.unloadAsync().catch(() => {});
    try {
      const created = await Audio.Sound.createAsync({ uri: voice.audioUri });
      sound.current = created.sound;
      setIsPlaying(true);
      created.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
      });
      await created.sound.playAsync();
    } catch { setIsPlaying(false); }
  };

  const celebrate = () => {
    const mode = voice.result ? 'voice' : 'text';
    const id = ensureSession(mode);
    updatePracticeSession(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      transcript: spokenText,
      duration: voice.result?.duration ?? 0,
      voiceScore: voice.result?.score ?? null,
      contentScore,
    });
    finishPractice(practice.id, earned);
    setCompletedMode(mode);
    setLastEarned(earned);
    setStep('celebrate');
  };

  const nextPractice = () => {
    setStep('build');
    setAnswer('');
    setSeconds(0);
    sessionIdRef.current = null;
    voice.reset();
  };

  if (step === 'celebrate') {
    return (
      <Screen>
        <View style={styles.celebrate}>
          <View style={styles.burst}><Text style={styles.burstEmoji}>🌟</Text></View>
          <Eyebrow>{completedMode === 'voice' ? '語音練習完成' : '文字練習完成'}</Eyebrow>
          <Text style={styles.celebrateTitle}>{completedMode === 'voice' ? '你啱啱用把聲，講咗一個完整想法。' : '你啱啱寫低並完成咗一個完整想法。'}</Text>
          <Text style={styles.celebrateCopy}>今次逐字稿、分數同練習時間已經存入「旅程」。撳下一關或者重新整理，都會繼續更高難度。</Text>
          <Card style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>今次獲得</Text>
            <Text style={styles.rewardValue}>＋{lastEarned} 信心值</Text>
            {completedMode === 'voice' && (voice.result?.score ?? 0) >= 70 && <Text style={styles.bonus}>包括「自然語調」＋5 獎勵</Text>}
          </Card>
          <PrimaryButton label={`下一關 · 第 ${difficultyFor(completedSessionCount).level} 級`} onPress={nextPractice} />
          <Text style={styles.refreshHint}>你亦可以重新整理頁面，系統會由下一關繼續。</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heading}>
            <View><Eyebrow>智能語音教練</Eyebrow><Title>直接講，聽下語氣。</Title></View>
            <View style={styles.pillStack}>
              <Pill tone="coral">第 {difficulty.level} 級</Pill>
              <Pill>{practiceIndex + 1}/{practices.length}</Pill>
            </View>
          </View>
          <ProgressBar value={step === 'build' ? 25 : step === 'speak' ? 60 : 100} />

          <Card style={styles.sceneCard}>
            <View style={styles.sceneTop}>
              <View style={styles.sceneIcon}><Text style={styles.sceneEmoji}>{practice.emoji}</Text></View>
              <View><Text style={styles.place}>{practice.place}</Text><Text style={styles.person}>對方係：{practice.stranger}</Text></View>
            </View>
            <Text style={styles.promptLabel}>對方同你講</Text>
            <Text style={styles.prompt}>{practice.prompt}</Text>
            <View style={styles.difficultyBox}>
              <Text style={styles.difficultyName}>今關：{difficulty.name}</Text>
              <Text style={styles.difficultyRequirement}>{difficulty.requirement}</Text>
              <Text style={styles.difficultyTarget}>目標最少 {targetChars} 個字</Text>
            </View>
          </Card>

          {step === 'build' && (
            <>
              <Text style={styles.instruction}>難度會跟完成次數提升；今次要做到：</Text>
              <Text style={styles.requirementText}>{difficulty.requirement}</Text>
              <View style={styles.starters}>
                {practice.starters.map((starter) => (
                  <Pressable key={starter} onPress={() => setAnswer((current) => current || starter)} style={({ pressed }) => [styles.starter, pressed && styles.pressed]}>
                    <Text style={styles.starterText}>{starter}…</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.inputWrap, sentenceLength(answer) >= practice.target && styles.inputReady]}>
                <TextInput
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="可以打字，或者等陣直接講…"
                  placeholderTextColor="#9A9FA9"
                  multiline
                  maxLength={120}
                  style={styles.input}
                  accessibilityLabel="你準備講嘅句子"
                />
              </View>
              <Pressable onPress={() => setAnswer(practice.example)} style={styles.exampleButton}>
                <Text style={styles.exampleText}>卡住咗？放入自然例句</Text>
              </Pressable>
              <Card style={styles.privacyCard}>
                <Text style={styles.privacyIcon}>🔒</Text>
                <View style={styles.privacyBody}>
                  <Text style={styles.privacyTitle}>撳開始先會用咪高峰</Text>
                  <Text style={styles.privacyText}>錄音只供即時重聽；語音轉文字由你嘅瀏覽器提供。你可以隨時停止。</Text>
                </View>
              </Card>
              <PrimaryButton label="🎙️  撳呢度，直接講" onPress={startSpeaking} />
              <View style={styles.reviewGap} />
              <PrimaryButton label="先分析我打嘅呢句" onPress={() => { ensureSession('text'); setStep('language'); }} disabled={!answer.trim()} secondary />
            </>
          )}

          {step === 'speak' && (
            <View style={styles.speakArea}>
              <Text style={styles.speakLabel}>而家聽緊你講…</Text>
              <View style={styles.liveText}>
                <Text style={styles.liveLabel}>即時聽到嘅文字</Text>
                <Text style={styles.liveTranscript}>{voice.transcript || answer || '開始講就會喺呢度出現'}</Text>
                <Text style={styles.liveHint}>{voice.speechRecognitionAvailable ? '廣東話字幕會一路跟住你把聲更新' : '此瀏覽器未提供字幕；錄音、聲量及語調分析仍會繼續'}</Text>
              </View>
              <View style={styles.mic}><View style={styles.micInner}><Text style={styles.micEmoji}>🎙️</Text></View></View>
              <View style={styles.waveRow}>{[12, 25, 40, 20, 34, 17, 29].map((height, index) => <View key={index} style={[styles.wave, { height: voice.active ? height : 8 }]} />)}</View>
              <Text style={styles.timer}>{seconds} 秒 · 分析音高、聲量同節奏</Text>
              <PrimaryButton label="我講完喇" onPress={stopSpeaking} />
            </View>
          )}

          {(step === 'review' || step === 'language') && (
            <View style={styles.review}>
              {voice.result ? (
                <>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreCircle}><Text style={styles.scoreValue}>{voice.result.score}</Text><Text style={styles.scoreUnit}>語氣分</Text></View>
                    <View style={styles.scoreBody}><Pill tone="mint">分析完成</Pill><Text style={styles.reviewTitle}>你把聲有咩特點？</Text></View>
                  </View>
                  <Text style={styles.disclaimer}>分析句子整體抑揚、聲量同節奏；唔會假裝判斷每一個廣東話字音啱唔啱。</Text>
                  <View style={styles.metrics}>
                    <Card style={styles.metric}><Text style={styles.metricEmoji}>〽️</Text><Text style={styles.metricValue}>{voice.result.pitchRange === null ? '未足夠' : `${Math.round(voice.result.pitchRange)} Hz`}</Text><Text style={styles.metricLabel}>音高變化</Text></Card>
                    <Card style={styles.metric}><Text style={styles.metricEmoji}>↗</Text><Text style={styles.metricValue}>{endingText(voice.result.ending)}</Text><Text style={styles.metricLabel}>句尾走勢</Text></Card>
                    <Card style={styles.metric}><Text style={styles.metricEmoji}>⏱</Text><Text style={styles.metricValue}>{voice.result.duration.toFixed(1)} 秒</Text><Text style={styles.metricLabel}>說話時間</Text></Card>
                  </View>
                  <Card style={styles.coachCard}><Text style={styles.coachLabel}>語氣建議</Text><Text style={styles.coachText}>{voiceFeedback(voice.result)}</Text></Card>
                </>
              ) : (
                <View style={styles.textAnalysisHeader}>
                  <Pill tone="coral">文字教練</Pill>
                  <Text style={styles.reviewTitle}>呢句可以點樣講得更好？</Text>
                  <Text style={styles.disclaimer}>以下會睇用字、想法、原因同細節；你可以逐項撳入句子。</Text>
                </View>
              )}
              <View style={styles.heardHeader}>
                <Text style={styles.transcriptLabel}>系統聽到你講</Text>
                <Text style={styles.editHint}>可以直接修正</Text>
              </View>
              <TextInput value={voice.transcript || answer} onChangeText={(value) => { voice.setTranscript(value); setAnswer(value); }} multiline style={styles.transcriptInput} />
              {!voice.speechRecognitionAvailable && <Text style={styles.unsupported}>呢個瀏覽器未支援廣東話轉文字，但語調分析同錄音仍然有效。</Text>}

              <Card style={styles.languageCard}>
                <View style={styles.languageTitleRow}>
                  <Text style={styles.languageIcon}>💬</Text>
                  <View style={styles.languageTitleBody}>
                    <Text style={styles.languageTitle}>用字同內容建議</Text>
                    <Text style={styles.languageSummary}>{languageAnalysis.summary}</Text>
                  </View>
                </View>
                {languageAnalysis.strengths.length > 0 && (
                  <View style={styles.strengthBox}>
                    <Text style={styles.strengthLabel}>做得好</Text>
                    {languageAnalysis.strengths.slice(0, 2).map((strength) => <Text key={strength} style={styles.strengthText}>✓ {strength}</Text>)}
                  </View>
                )}
                {languageAnalysis.wordingChanges.map((change) => (
                  <View key={`${change.from}-${change.to}`} style={styles.wordingRow}>
                    <View style={styles.wordingTop}>
                      <Text style={styles.wordingFrom}>{change.from}</Text>
                      <Text style={styles.wordingArrow}>→</Text>
                      <Pressable onPress={() => { voice.setTranscript(change.to); setAnswer(change.to); }}><Text style={styles.wordingTo}>{change.to} ＋</Text></Pressable>
                    </View>
                    <Text style={styles.wordingReason}>{change.reason}</Text>
                  </View>
                ))}
                {languageAnalysis.elaborations.length > 0 && <Text style={styles.addLabel}>你仲可以加：</Text>}
                <View style={styles.ideaList}>
                  {languageAnalysis.elaborations.map((idea) => (
                    <Pressable
                      key={idea.id}
                      onPress={() => {
                        const updated = appendFragment(voice.transcript || answer, idea.fragment);
                        voice.setTranscript(updated);
                        setAnswer(updated);
                      }}
                      style={({ pressed }) => [styles.ideaButton, pressed && styles.pressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`${idea.label}：${idea.fragment}`}
                    >
                      <Text style={styles.ideaLabel}>{idea.label}</Text>
                      <Text style={styles.ideaFragment}>＋ {idea.fragment}</Text>
                      <Text style={styles.ideaExplanation}>{idea.explanation}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.upgradeBox}>
                  <Text style={styles.upgradeLabel}>升級後可以咁講</Text>
                  <Text style={styles.upgradeText}>「{languageAnalysis.upgradedExample}」</Text>
                  <Pressable
                    onPress={() => { voice.setTranscript(languageAnalysis.upgradedExample); setAnswer(languageAnalysis.upgradedExample); }}
                    style={styles.useUpgrade}
                  >
                    <Text style={styles.useUpgradeText}>套用呢句</Text>
                  </Pressable>
                </View>
              </Card>
              {voice.audioUri && <PrimaryButton label={isPlaying ? '播放緊…' : '▶ 重聽我把聲'} onPress={playRecording} secondary />}
              <View style={styles.reviewGap} />
              {step === 'review' ? (
                <PrimaryButton label={ready ? '完成，收取信心值' : '我有試，照樣完成'} onPress={celebrate} />
              ) : (
                <>
                  <PrimaryButton label="用升級句再開聲" onPress={() => setStep('build')} />
                  <View style={styles.reviewGap} />
                  <PrimaryButton label="先完成文字練習" onPress={celebrate} secondary />
                </>
              )}
              <Pressable onPress={() => {
                if (sessionIdRef.current) updatePracticeSession(sessionIdRef.current, { transcript: spokenText, contentScore });
                if (step === 'review') sessionIdRef.current = null;
                voice.reset();
                setStep('build');
              }} style={styles.retry}><Text style={styles.retryText}>{step === 'review' ? '再講一次（會記作新嘗試）' : '返回修改'}</Text></Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 14 }, pillStack: { alignItems: 'flex-end', gap: 6 },
  sceneCard: { marginTop: 20, backgroundColor: colors.sky, borderColor: '#C8DEE7', shadowOpacity: 0 },
  sceneTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  sceneIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sceneEmoji: { fontSize: 25 }, place: { color: colors.ink, fontSize: 17, fontWeight: '900' }, person: { color: colors.muted, fontSize: 12, marginTop: 2 },
  promptLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginBottom: 4 }, prompt: { color: colors.ink, fontSize: 21, lineHeight: 30, fontWeight: '900' }, difficultyBox: { backgroundColor: colors.paper, borderRadius: 14, padding: 11, marginTop: 13 }, difficultyName: { color: colors.coral, fontSize: 10, fontWeight: '900' }, difficultyRequirement: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 }, difficultyTarget: { color: colors.muted, fontSize: 9, marginTop: 3 },
  instruction: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 22, marginBottom: 4 }, requirementText: { color: colors.coral, fontSize: 13, fontWeight: '900', marginBottom: 10 },
  starters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, starter: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 13, paddingVertical: 10 }, starterText: { color: colors.navy, fontSize: 13, fontWeight: '800' }, pressed: { opacity: 0.7 },
  inputWrap: { backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.line, borderRadius: 20, marginTop: 14, padding: 15 }, inputReady: { borderColor: colors.success }, input: { color: colors.ink, fontSize: 18, lineHeight: 27, minHeight: 68, textAlignVertical: 'top' },
  exampleButton: { alignItems: 'center', paddingVertical: 14 }, exampleText: { color: colors.navy, fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },
  privacyCard: { flexDirection: 'row', padding: 13, marginBottom: 12, backgroundColor: colors.mint, borderColor: '#C9DDC9', shadowOpacity: 0 }, privacyIcon: { fontSize: 19, marginRight: 9 }, privacyBody: { flex: 1 }, privacyTitle: { color: colors.ink, fontSize: 11, fontWeight: '900' }, privacyText: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 2 },
  speakArea: { marginTop: 24, alignItems: 'center' }, speakLabel: { color: colors.coral, fontSize: 12, fontWeight: '900' },
  liveText: { width: '100%', minHeight: 110, backgroundColor: colors.paper, borderRadius: 20, padding: 16, marginVertical: 16, borderWidth: 2, borderColor: colors.navy }, liveLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' }, liveTranscript: { color: colors.ink, fontSize: 20, lineHeight: 29, fontWeight: '800', marginTop: 5 }, liveHint: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  mic: { width: 118, height: 118, borderRadius: 59, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' }, micInner: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' }, micEmoji: { fontSize: 36 },
  waveRow: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }, wave: { width: 5, borderRadius: 4, backgroundColor: colors.coral }, timer: { color: colors.coral, fontSize: 12, fontWeight: '800', marginBottom: 20 },
  review: { marginTop: 24 }, textAnalysisHeader: { marginBottom: 8 }, scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 }, scoreCircle: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, scoreValue: { color: colors.white, fontSize: 28, fontWeight: '900' }, scoreUnit: { color: '#BDD0E8', fontSize: 9, fontWeight: '800' }, scoreBody: { flex: 1 }, reviewTitle: { color: colors.ink, fontSize: 23, lineHeight: 30, fontWeight: '900', marginTop: 7 }, disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 3, marginBottom: 12 },
  metrics: { flexDirection: 'row', gap: 7 }, metric: { flex: 1, padding: 11, borderRadius: 16, shadowOpacity: 0 }, metricEmoji: { fontSize: 17, marginBottom: 5 }, metricValue: { color: colors.ink, fontSize: 12, fontWeight: '900' }, metricLabel: { color: colors.muted, fontSize: 9, marginTop: 3 },
  coachCard: { backgroundColor: colors.coralSoft, borderColor: '#F4CABB', shadowOpacity: 0, marginVertical: 12 }, coachLabel: { color: colors.coral, fontSize: 10, fontWeight: '900' }, coachText: { color: colors.ink, fontSize: 14, lineHeight: 21, fontWeight: '700', marginTop: 4 },
  heardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, transcriptLabel: { color: colors.ink, fontSize: 12, fontWeight: '900' }, editHint: { color: colors.muted, fontSize: 9, fontWeight: '700' }, transcriptInput: { minHeight: 76, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.navy, borderRadius: 15, padding: 12, color: colors.ink, fontSize: 16, lineHeight: 23, textAlignVertical: 'top', marginBottom: 10 }, unsupported: { color: colors.muted, fontSize: 10, lineHeight: 15, marginBottom: 10 },
  languageCard: { backgroundColor: '#FFF8E8', borderColor: '#EAD7A2', shadowOpacity: 0, marginBottom: 12 }, languageTitleRow: { flexDirection: 'row', alignItems: 'flex-start' }, languageIcon: { fontSize: 25, marginRight: 10 }, languageTitleBody: { flex: 1 }, languageTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, languageSummary: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 3 },
  strengthBox: { backgroundColor: colors.mint, borderRadius: 13, padding: 10, marginTop: 12 }, strengthLabel: { color: colors.success, fontSize: 9, fontWeight: '900', marginBottom: 3 }, strengthText: { color: colors.ink, fontSize: 10, lineHeight: 16 }, wordingRow: { borderTopWidth: 1, borderTopColor: '#EAD7A2', paddingTop: 11, marginTop: 11 }, wordingTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 }, wordingFrom: { color: colors.muted, fontSize: 12, textDecorationLine: 'line-through' }, wordingArrow: { color: colors.muted, fontSize: 12 }, wordingTo: { color: colors.coral, fontSize: 13, fontWeight: '900' }, wordingReason: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  addLabel: { color: colors.ink, fontSize: 11, fontWeight: '900', marginTop: 14, marginBottom: 7 }, ideaList: { gap: 7 }, ideaButton: { backgroundColor: colors.paper, borderWidth: 1, borderColor: '#E5D4A9', borderRadius: 13, padding: 10 }, ideaLabel: { color: colors.navy, fontSize: 10, fontWeight: '900' }, ideaFragment: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 2 }, ideaExplanation: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3 }, upgradeBox: { backgroundColor: colors.navy, borderRadius: 15, padding: 13, marginTop: 12 }, upgradeLabel: { color: '#BFD0E8', fontSize: 9, fontWeight: '900' }, upgradeText: { color: colors.white, fontSize: 14, lineHeight: 21, fontWeight: '800', marginTop: 4 }, useUpgrade: { alignSelf: 'flex-start', backgroundColor: colors.coral, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 7, marginTop: 9 }, useUpgradeText: { color: colors.white, fontSize: 10, fontWeight: '900' },
  reviewGap: { height: 10 }, retry: { alignItems: 'center', padding: 15 }, retryText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  celebrate: { paddingTop: 44 }, burst: { height: 180, borderRadius: 34, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 25 }, burstEmoji: { fontSize: 82 }, celebrateTitle: { color: colors.ink, fontSize: 29, lineHeight: 38, fontWeight: '900', marginTop: 5 }, celebrateCopy: { color: colors.muted, fontSize: 15, lineHeight: 24, marginTop: 9, marginBottom: 18 }, rewardCard: { backgroundColor: colors.navy, borderColor: colors.navy, marginBottom: 18, alignItems: 'center' }, rewardLabel: { color: '#BFD0E8', fontSize: 11, fontWeight: '800' }, rewardValue: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 3 }, bonus: { color: colors.gold, fontSize: 10, fontWeight: '800', marginTop: 4 }, refreshHint: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 10 },
});
