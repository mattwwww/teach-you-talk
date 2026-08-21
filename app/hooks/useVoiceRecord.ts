import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';

export type RecordState = 'idle' | 'recording' | 'done';

export function useVoiceRecord() {
  const [state, setState] = useState<RecordState>('idle');
  const [uri, setUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const startRecording = async (): Promise<boolean> => {
    if (recordingRef.current) return false;
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要麥克風權限', '請去設定開啟麥克風權限先可以錄音。');
      return false;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setState('recording');
      return true;
    } catch {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      Alert.alert('錄音失敗', '未能啟動錄音，請再試。');
      return false;
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    await recordingRef.current.stopAndUnloadAsync();
    const fileUri = recordingRef.current.getURI();
    recordingRef.current = null;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    setUri(fileUri ?? null);
    setState('done');
  };

  const reset = () => {
    setUri(null);
    setState('idle');
  };

  return { state, uri, startRecording, stopRecording, reset };
}
