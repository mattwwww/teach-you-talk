import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>💥</Text>
          <Text style={styles.title}>出咗問題喎</Text>
          <Text style={styles.msg}>{this.state.message}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={this.reset}
            accessibilityLabel="重試"
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>重試</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e17', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  msg: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btn: { backgroundColor: '#e94560', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
