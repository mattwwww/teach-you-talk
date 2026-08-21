import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { type StreetMission } from '../../types/content';

interface Props {
  mission: StreetMission;
  completed: boolean;
  onComplete: (id: string, reflection: string) => void;
}

export function QuestCard({ mission, completed, onComplete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [reflection, setReflection] = useState('');

  const submit = () => {
    onComplete(mission.id, reflection);
    setShowModal(false);
    setReflection('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.card, completed && styles.cardDone]}
        onPress={() => !completed && setShowModal(true)}
        disabled={completed}
        accessibilityLabel={completed ? `${mission.text} — 已完成` : `完成任務：${mission.text}`}
        accessibilityRole="button"
      >
        <View style={styles.check}>
          <Text style={styles.checkText}>{completed ? '✅' : '⬜'}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.text, completed && styles.textDone]}>{mission.text}</Text>
          <Text style={styles.detail}>{mission.detail}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>完成任務？</Text>
            <Text style={styles.modalTask}>{mission.text}</Text>
            <Text style={styles.reflectLabel}>你當時有咩感覺？（一句就夠）</Text>
            <TextInput
              style={styles.reflectInput}
              value={reflection}
              onChangeText={setReflection}
              placeholder="我覺得..."
              placeholderTextColor="#555"
              multiline
              maxLength={200}
              accessibilityLabel="輸入你嘅感受"
            />
            <TouchableOpacity
              style={[styles.submitBtn, !reflection.trim() && styles.submitBtnDisabled]}
              onPress={submit}
              disabled={!reflection.trim()}
              accessibilityLabel="確認完成任務"
              accessibilityRole="button"
            >
              <Text style={styles.submitText}>✅ 確認完成</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowModal(false)}
              accessibilityLabel="取消，未做到"
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>未做到，下次再嚟</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  cardDone: { opacity: 0.5 },
  check: { marginRight: 12, marginTop: 2 },
  checkText: { fontSize: 20 },
  content: { flex: 1 },
  text: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  textDone: { textDecorationLine: 'line-through', color: '#888' },
  detail: { color: '#888', fontSize: 13, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: { color: '#f0c040', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  modalTask: { color: '#fff', fontSize: 16, marginBottom: 20, lineHeight: 24 },
  reflectLabel: { color: '#888', fontSize: 14, marginBottom: 8 },
  reflectInput: {
    backgroundColor: '#0f0e17',
    color: '#fff',
    fontSize: 15,
    padding: 14,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: { backgroundColor: '#4ade80', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  submitBtnDisabled: { backgroundColor: '#2a4a2a' },
  submitText: { color: '#000', fontSize: 15, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelText: { color: '#888', fontSize: 14 },
});
