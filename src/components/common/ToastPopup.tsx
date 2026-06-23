import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/theme';
import { AppIcon } from '@/components/common/AppIcon';

interface ToastPopupProps {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
  onHide: () => void;
}

export const ToastPopup = memo(function ToastPopup({
  visible,
  type,
  message,
  onHide,
}: ToastPopupProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-12);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220 });
      translateY.value = withTiming(0, { duration: 220 });
      const timer = setTimeout(onHide, 3200);
      return () => clearTimeout(timer);
    }

    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(-12, { duration: 180 });
  }, [visible, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  const isSuccess = type === 'success';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onHide}
        style={[
          styles.toast,
          isSuccess ? styles.success : styles.error,
        ]}>
        <View style={styles.iconWrap}>
          <AppIcon
            name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={isSuccess ? colors.success : colors.error}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isSuccess ? 'Sync successful' : 'Sync failed'}
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  toast: {
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  success: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
  },
  error: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
