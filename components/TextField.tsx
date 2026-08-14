import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput as RNTextInput, View, type KeyboardTypeOptions } from 'react-native';
import { colors, radii, spacing, typography } from '@/src/theme';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
}: TextFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as never}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((h) => !h)} style={styles.toggle} accessibilityRole="button">
            {hidden ? <EyeOff color={colors.muted} size={20} /> : <Eye color={colors.primary} size={20} />}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: colors.secondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.sm },
  toggle: { padding: spacing.xs },
});
