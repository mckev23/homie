import { House } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/src/theme';

export function BrandMark() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <House color={colors.secondary} size={24} strokeWidth={2} />
      </View>
      <Text style={styles.wordmark}>
        homi<Text style={styles.accent}>e</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 6 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { ...typography.heading, color: colors.secondary, letterSpacing: 1 },
  accent: { color: colors.primary },
});
