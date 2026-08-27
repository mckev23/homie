import { Quicksand_700Bold, useFonts } from '@expo-google-fonts/quicksand';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme';

/*
Renders the "hōm" wordmark: Quicksand Bold with the macron drawn as a small
rounded rectangle above the "o", rather than a font glyph or an image asset.
Not yet wired into any live screen — see BRANDING.md for rollout status.
*/

type WordmarkProps = { size?: number; color?: string };

export function Wordmark({ size = 40, color = colors.secondary }: WordmarkProps) {
  const [fontsLoaded] = useFonts({ Quicksand_700Bold });

  const letterStyle = {
    fontFamily: fontsLoaded ? 'Quicksand_700Bold' : undefined,
    fontWeight: fontsLoaded ? undefined : ('700' as const),
    fontSize: size,
    lineHeight: size * 1.15,
    color,
  };

  const macronWidth = size * 0.34;
  const macronHeight = Math.max(2, size * 0.08);

  return (
    <View style={styles.row}>
      <Text style={letterStyle}>h</Text>
      <View style={styles.oWrap}>
        <View
          style={[
            styles.macron,
            {
              width: macronWidth,
              height: macronHeight,
              borderRadius: macronHeight / 2,
              backgroundColor: color,
              top: -size * 0.32,
            },
          ]}
        />
        <Text style={letterStyle}>o</Text>
      </View>
      <Text style={letterStyle}>m</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  oWrap: { alignItems: 'center' },
  macron: { position: 'absolute', alignSelf: 'center' },
});
