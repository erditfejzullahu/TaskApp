import React, { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { TaskFormValues } from '@/utils/validation';
import { colors } from '@/theme';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { dismissKeyboardAndWait } from '@/utils/keyboard';
import { TaskForm } from '@/components/tasks/TaskForm';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTask'>;

export function CreateTaskScreen({ navigation }: Props) {
  const { createMutation } = useTaskMutations();

  const handleSubmit = useCallback(
    async (values: TaskFormValues) => {
      await dismissKeyboardAndWait();
      try {
        await createMutation.mutateAsync(values);
        navigation.goBack();
      } catch (error) {
        Alert.alert(
          'Create failed',
          error instanceof Error ? error.message : 'Unable to create task.',
        );
      }
    },
    [createMutation, navigation],
  );

  return (
    <View style={styles.container}>
      <TaskForm
        submitLabel="Create task"
        onSubmit={handleSubmit}
        loading={createMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
