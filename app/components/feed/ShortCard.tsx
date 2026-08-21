import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { RecordButton } from '../arena/RecordButton';
import { LevelGate } from '../gatekeeper/LevelGate';
import { useVoiceRecord } from '../../hooks/useVoiceRecord';
import { type FeedCard } from '../../types/content';

interface Props {
  card: FeedCard;
  onComplete: () => void;
}

export function ShortCard({ card, onComplete }: Props) {
  const [showModel, setShowModel] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { state: recordState, startRecording, stopRecording } = useVoiceRecord();

  if (card.type === 'passive') {
    return (
      <View style={styles.card}>
        <Text style={styles.location}>📍 {card.location}</Text>
        <Text style={styles.emoji}>{card.emoji}</Text>
        <Text style={styles.scenario}>{card.scenario}</Text>

        {!showModel ? (
          <TouchableOpacity
            style={styles.modelBtn}
            onPress={() => setShowModel(true)}
            accessibilityLabel="睇示範答案"
            accessibilityRole="button"
          >
            <Text style={styles.modelBtnText}>睇示範答案</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.modelBox}>
            <Text style={styles.modelLabel}>示範：</Text>
            <Text style={styles.modelText}>「{card.modelResponse}」</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={onComplete}
          accessibilityLabel="下一張"
          accessibilityRole="button"
        >
          <Text style={styles.nextBtnText}>下一張 →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.location}>📍 {card.location}</Text>
      <Text style={styles.emoji}>{card.emoji}</Text>
      <Text style={styles.scenario}>{card.scenario}</Text>
      <Text style={styles.prompt}>{card.prompt}</Text>

      {!submitted ? (
        <>
          <TextInput
            style={styles.input}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="打低你嘅答案..."
            placeholderTextColor="#555"
            multiline
            maxLength={300}
            accessibilityLabel="輸入你嘅答案"
          />
          <RecordButton
            state={recordState}
            onStart={startRecording}
            onStop={stopRecording}
          />
          {recordState === 'done' ? (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setSubmitted(true)}
              accessibilityLabel="提交錄音答案"
              accessibilityRole="button"
            >
              <Text style={styles.nextBtnText}>✅ 提交錄音答案</Text>
            </TouchableOpacity>
          ) : (
            <LevelGate
              input={textInput}
              minWords={card.minWords}
              scaffolds={card.scaffolds}
              onAccept={async () => {
                if (recordState === 'recording') await stopRecording();
                setSubmitted(true);
              }}
            />
          )}
        </>
      ) : (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>✅ 答咗喇！</Text>
          {textInput.trim() ? (
            <Text style={styles.yourAnswer}>你講：「{textInput}」</Text>
          ) : (
            <Text style={styles.yourAnswer}>🎤 錄音已提交</Text>
          )}
          {card.scaffolds.length > 0 && (
            <View style={styles.refBox}>
              <Text style={styles.refLabel}>參考答案：</Text>
              {card.scaffolds.map((s, i) => (
                <Text key={i} style={styles.refItem}>👉 {s}</Text>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={onComplete}
            accessibilityLabel="下一張"
            accessibilityRole="button"
          >
            <Text style={styles.nextBtnText}>下一張 →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#0f0e17',
    padding: 24,
    justifyContent: 'center',
  },
  location: { color: '#e94560', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  emoji: { fontSize: 48, marginBottom: 12 },
  scenario: { color: '#fff', fontSize: 18, lineHeight: 28, marginBottom: 16 },
  prompt: { color: '#f0c040', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  modelBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  modelBtnText: { color: '#888', fontSize: 14 },
  modelBox: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  modelLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  modelText: { color: '#4ade80', fontSize: 16 },
  nextBtn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  doneBox: { alignItems: 'center', marginTop: 16 },
  doneText: { color: '#4ade80', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  yourAnswer: { color: '#ccc', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  refBox: { backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginBottom: 12, alignSelf: 'stretch' },
  refLabel: { color: '#888', fontSize: 12, marginBottom: 6 },
  refItem: { color: '#a8d8ea', fontSize: 14, lineHeight: 22 },
});
