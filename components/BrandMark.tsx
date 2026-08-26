import { Image, StyleSheet, View } from 'react-native';

const LOGO = require('@/assets/images/homie-logo.png');
const LOGO_ASPECT_RATIO = 838 / 752;

type BrandMarkProps = { width?: number };

export function BrandMark({ width = 168 }: BrandMarkProps) {
  return (
    <View style={styles.container}>
      <Image
        source={LOGO}
        style={{ width, height: width / LOGO_ASPECT_RATIO }}
        resizeMode="contain"
        accessibilityLabel="Homie"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});
