import type { ReactNode } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, shadow } from './theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (!scroll) return <SafeAreaView style={styles.safe}>{children}</SafeAreaView>;
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ children, tone = 'sky' }: { children: ReactNode; tone?: 'sky' | 'coral' | 'mint' }) {
  return (
    <View style={[styles.pill, tone === 'coral' && styles.pillCoral, tone === 'mint' && styles.pillMint]}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.coral }: { value: number; color?: string }) {
  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 120 },
  eyebrow: { color: colors.coral, fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 38, fontWeight: '900', letterSpacing: -0.6 },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    ...shadow,
  },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.sky, borderRadius: 100, paddingHorizontal: 11, paddingVertical: 6 },
  pillCoral: { backgroundColor: colors.coralSoft },
  pillMint: { backgroundColor: colors.mint },
  pillText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  button: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonSecondary: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.navy },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  buttonTextSecondary: { color: colors.navy },
  track: { height: 9, borderRadius: 10, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 10 },
});
