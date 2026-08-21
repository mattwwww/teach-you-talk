import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type VoiceResult = {
  duration: number;
  averageVolume: number;
  volumeVariation: number;
  pitchRange: number | null;
  ending: 'rising' | 'falling' | 'steady' | 'unknown';
  score: number;
};

type BrowserSpeechResult = {
  0: { transcript: string };
  isFinal: boolean;
};

type BrowserSpeechEvent = {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechResult>;
};

type BrowserRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: BrowserSpeechEvent) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserRecognitionConstructor = new () => BrowserRecognition;

function percentile(values: number[], ratio: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
}

function detectPitch(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.018) return 0;

  const minLag = Math.floor(sampleRate / 420);
  const maxLag = Math.min(Math.floor(sampleRate / 75), buffer.length - 1);
  let bestLag = 0;
  let bestCorrelation = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - lag; i += 1) {
      correlation += buffer[i]! * buffer[i + lag]!;
    }
    correlation /= buffer.length - lag;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }
  return bestCorrelation > 0.008 && bestLag ? sampleRate / bestLag : 0;
}

function analyseVoice(volumes: number[], pitches: number[], duration: number): VoiceResult {
  const averageVolume = volumes.length ? volumes.reduce((sum, value) => sum + value, 0) / volumes.length : 0;
  const volumeVariation = volumes.length
    ? Math.sqrt(volumes.reduce((sum, value) => sum + ((value - averageVolume) ** 2), 0) / volumes.length)
    : 0;
  const validPitches = pitches.filter((value) => value >= 75 && value <= 420);
  const pitchRange = validPitches.length >= 4
    ? Math.max(0, percentile(validPitches, 0.9) - percentile(validPitches, 0.1))
    : null;
  let ending: VoiceResult['ending'] = 'unknown';
  if (validPitches.length >= 6) {
    const section = Math.max(2, Math.floor(validPitches.length / 4));
    const start = validPitches.slice(0, section).reduce((sum, value) => sum + value, 0) / section;
    const end = validPitches.slice(-section).reduce((sum, value) => sum + value, 0) / section;
    ending = end > start * 1.08 ? 'rising' : end < start * 0.92 ? 'falling' : 'steady';
  }
  const durationPoints = Math.min(22, duration * 4);
  const volumePoints = Math.min(25, averageVolume * 520);
  const variationPoints = Math.min(22, volumeVariation * 950);
  const pitchPoints = pitchRange === null ? 10 : Math.min(31, 8 + pitchRange / 3.2);
  return {
    duration,
    averageVolume,
    volumeVariation,
    pitchRange,
    ending,
    score: Math.round(Math.max(20, Math.min(100, durationPoints + volumePoints + variationPoints + pitchPoints))),
  };
}

export function useVoiceCoach() {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const volumeSamples = useRef<number[]>([]);
  const pitchSamples = useRef<number[]>([]);

  const cleanupWeb = useCallback(() => {
    if (animationRef.current !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    contextRef.current?.close().catch(() => {});
    contextRef.current = null;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const speechWindow = window as typeof window & {
        SpeechRecognition?: BrowserRecognitionConstructor;
        webkitSpeechRecognition?: BrowserRecognitionConstructor;
      };
      setSpeechRecognitionAvailable(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
    }
    return () => {
      cleanupWeb();
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, [cleanupWeb]);

  const start = useCallback(async () => {
    setTranscript('');
    setResult(null);
    setAudioUri(null);
    volumeSamples.current = [];
    pitchSamples.current = [];
    startTimeRef.current = Date.now();

    if (Platform.OS === 'web') {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('microphone-unavailable');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error('audio-analysis-unavailable');
      const context = new AudioContextClass();
      contextRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      context.createMediaStreamSource(stream).connect(analyser);
      const timeData = new Float32Array(analyser.fftSize);
      let lastSampleAt = 0;
      const sample = (timestamp = 0) => {
        if (timestamp - lastSampleAt >= 90) {
          lastSampleAt = timestamp;
          analyser.getFloatTimeDomainData(timeData);
          let rms = 0;
          for (const value of timeData) rms += value * value;
          volumeSamples.current.push(Math.sqrt(rms / timeData.length));
          const pitch = detectPitch(timeData, context.sampleRate);
          if (pitch) pitchSamples.current.push(pitch);
        }
        animationRef.current = requestAnimationFrame(sample);
      };
      sample();

      if (typeof MediaRecorder !== 'undefined') {
        const chunks: Blob[] = [];
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
        recorder.onstop = () => setAudioUri(URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })));
        recorder.start();
      }

      const speechWindow = window as typeof window & {
        SpeechRecognition?: BrowserRecognitionConstructor;
        webkitSpeechRecognition?: BrowserRecognitionConstructor;
      };
      const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (Recognition) {
        const recognition = new Recognition();
        recognition.lang = 'zh-HK';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i += 1) text += event.results[i]?.[0]?.transcript ?? '';
          setTranscript(text.trim());
        };
        recognition.onerror = () => {};
        recognitionRef.current = recognition;
        try { recognition.start(); } catch {}
      }
      setActive(true);
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== 'granted') throw new Error('permission-denied');
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const created = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    created.recording.setProgressUpdateInterval(120);
    created.recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && typeof status.metering === 'number') {
        volumeSamples.current.push(Math.max(0, (status.metering + 60) / 60) * 0.12);
      }
    });
    recordingRef.current = created.recording;
    setActive(true);
  }, []);

  const stop = useCallback(async () => {
    const duration = Math.max(0.5, (Date.now() - startTimeRef.current) / 1000);
    if (Platform.OS === 'web') {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      recorderRef.current = null;
      cleanupWeb();
    } else if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        setAudioUri(recordingRef.current.getURI());
      } finally {
        recordingRef.current = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      }
    }
    const analysed = analyseVoice(volumeSamples.current, pitchSamples.current, duration);
    setResult(analysed);
    setActive(false);
    return analysed;
  }, [cleanupWeb]);

  const reset = useCallback(() => {
    cleanupWeb();
    setActive(false);
    setTranscript('');
    setAudioUri(null);
    setResult(null);
  }, [cleanupWeb]);

  return { active, transcript, setTranscript, audioUri, result, speechRecognitionAvailable, start, stop, reset };
}
