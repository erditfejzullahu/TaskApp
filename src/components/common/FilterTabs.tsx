import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompletionFilter } from '@/types/task';
import { colors, spacing, typography } from '@/theme';

const FILTERS: { key: CompletionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
];

interface FilterTabsProps {
  value: CompletionFilter;
  onChange: (filter: CompletionFilter) => void;
}

export const FilterTabs = memo(function FilterTabs({
  value,
  onChange,
}: FilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        {FILTERS.map(filter => (
          <FilterTab
            key={filter.key}
            label={filter.label}
            active={value === filter.key}
            onPress={() => onChange(filter.key)}
          />
        ))}
      </View>
    </View>
  );
});

interface FilterTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterTab = memo(function FilterTab({
  label,
  active,
  onPress,
}: FilterTabProps) {
  const handlePress = useCallback(() => onPress(), [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
