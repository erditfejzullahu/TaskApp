import React, { memo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { AppIcon } from '@/components/common/AppIcon';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchInput = memo(function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search tasks...',
}: SearchInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <AppIcon
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.icon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
});
