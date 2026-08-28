import { Image, StyleSheet, View } from 'react-native';
import { Wordmark } from '@/components/Wordmark';

const ICON = require('@/assets/images/hom-icon.png');

type BrandMarkProps = { width?: number };

export function BrandMark({ width = 168 }: BrandMarkProps) {
  const iconSize = width * 0.32;
  const wordmarkSize = width * 0.24;

  return (
    <View style={styles.row}>
      <Image source={ICON} style={{ width: iconSize, height: iconSize }} resizeMode="contain" accessibilityLabel="hōm" />
      <Wordmark size={wordmarkSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
