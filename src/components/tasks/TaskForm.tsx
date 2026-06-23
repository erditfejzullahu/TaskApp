import React, { memo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  defaultTaskFormValues,
  taskFormSchema,
  type TaskFormValues,
} from '@/utils/validation';
import { colors, spacing, typography } from '@/theme';
import { Button } from '@/components/common/Button';

interface TaskFormProps {
  initialValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
  loading?: boolean;
}

export const TaskForm = memo(function TaskForm({
  initialValues = defaultTaskFormValues,
  submitLabel,
  onSubmit,
  loading = false,
}: TaskFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, errors.title && styles.inputError]}
                returnKeyType="next"
              />
            )}
          />
          {errors.title ? (
            <Text style={styles.error}>{errors.title.message}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.hint}>Optional — add context or details</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Add optional details..."
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
          {errors.description ? (
            <Text style={styles.error}>{errors.description.message}</Text>
          ) : null}
        </View>

        <View style={styles.switchCard}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Mark as completed</Text>
            <Text style={styles.switchHint}>Toggle completion status</Text>
          </View>
          <Controller
            control={control}
            name="completed"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={value ? colors.primary : colors.surface}
              />
            )}
          />
        </View>

        <Button
          label={submitLabel}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: 4,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    minHeight: 110,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  switchInfo: {
    gap: 2,
  },
  switchLabel: {
    ...typography.label,
    color: colors.text,
  },
  switchHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  submit: {
    marginTop: spacing.xs,
  },
});
