import React, { memo, useCallback, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Task } from '@/types/task';
import { colors, spacing, typography } from '@/theme';
import { AppIcon, type IoniconName } from '@/components/common/AppIcon';

const SHEET_OFFSCREEN = 320;
const DISMISS_THRESHOLD = 72;
const DISMISS_VELOCITY = 650;
const SPRING_CONFIG = { damping: 26, stiffness: 340, mass: 0.75 } as const;

interface TaskActionMenuProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggle: (taskId: string) => void;
}

interface ActionRowProps {
  icon: IoniconName;
  label: string;
  color?: string;
  onPress: () => void;
}

const ActionRow = memo(function ActionRow({
  icon,
  label,
  color = colors.text,
  onPress,
}: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
      <AppIcon name={icon} size={20} color={color} style={styles.actionIcon} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
});

export const TaskActionMenu = memo(function TaskActionMenu({
  task,
  visible,
  onClose,
  onEdit,
  onDelete,
  onToggle,
}: TaskActionMenuProps) {
  const translateY = useSharedValue(SHEET_OFFSCREEN);
  const backdropOpacity = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  // Reset shared values when the modal closes so the next open starts off-screen.
  useEffect(() => {
    if (!visible) {
      cancelAnimation(translateY);
      cancelAnimation(backdropOpacity);
      translateY.value = SHEET_OFFSCREEN;
      backdropOpacity.value = 0;
    }
  }, [visible, translateY, backdropOpacity]);

  // Start the slide-in AFTER the native Modal window is fully mounted (onShow).
  // Using onShow instead of useLayoutEffect prevents the animation from playing
  // into an invisible surface, which caused the intermittent "didn't open" issue.
  const handleShow = useCallback(() => {
    translateY.value = withSpring(0, SPRING_CONFIG);
    backdropOpacity.value = withTiming(1, { duration: 160 });
  }, [translateY, backdropOpacity]);

  // JS-side dismiss used by backdrop tap, Cancel, and Android back button.
  const handleDismiss = useCallback(() => {
    translateY.value = withTiming(
      SHEET_OFFSCREEN,
      { duration: 220 },
      finished => {
        if (finished) runOnJS(onClose)();
      },
    );
    backdropOpacity.value = withTiming(0, { duration: 180 });
  }, [translateY, backdropOpacity, onClose]);

  // Pan gesture runs entirely on the UI thread.
  // The dismiss animation is inlined here (no runOnJS wrapper around it) so
  // it stays on the UI thread without the double-hop that was breaking swipe-to-close.
  const panGesture = Gesture.Pan()
    .activeOffsetY(6)
    .failOffsetX([-24, 24])
    .onStart(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate(event => {
      const next = dragStartY.value + event.translationY;
      translateY.value = Math.max(0, next);
      backdropOpacity.value = Math.max(0, 1 - translateY.value / SHEET_OFFSCREEN);
    })
    .onEnd(event => {
      const shouldDismiss =
        translateY.value > DISMISS_THRESHOLD ||
        event.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        translateY.value = withTiming(
          SHEET_OFFSCREEN,
          { duration: 220 },
          finished => {
            if (finished) runOnJS(onClose)();
          },
        );
        backdropOpacity.value = withTiming(0, { duration: 180 });
        return;
      }

      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 160 });
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!task) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onShow={handleShow}
      onRequestClose={handleDismiss}
      statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </Pressable>

          <Animated.View style={[styles.sheet, sheetStyle]}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={styles.dragZone}>
                <View style={styles.handle} />
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
              </Animated.View>
            </GestureDetector>

            <View style={styles.divider} />

            <ActionRow
              icon="create-outline"
              label="Edit task"
              onPress={() => {
                onClose();
                onEdit(task.id);
              }}
            />
            <View style={styles.divider} />
            <ActionRow
              icon={task.completed ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
              label={task.completed ? 'Mark as active' : 'Mark as completed'}
              color={task.completed ? colors.textSecondary : colors.success}
              onPress={() => {
                onClose();
                onToggle(task.id);
              }}
            />
            <View style={styles.divider} />
            <ActionRow
              icon="trash-outline"
              label="Delete task"
              color={colors.error}
              onPress={() => {
                onClose();
                onDelete(task.id);
              }}
            />

            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  dragZone: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  taskTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  actionRowPressed: {
    backgroundColor: colors.background,
  },
  actionIcon: {
    width: 24,
    textAlign: 'center',
  },
  actionLabel: {
    ...typography.body,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
