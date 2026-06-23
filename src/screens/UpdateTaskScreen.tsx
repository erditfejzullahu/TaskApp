import React, { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { TaskFormValues } from '@/utils/validation';
import { colors } from '@/theme';
import { useTaskStore } from '@/store/taskStore';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ErrorState } from '@/components/common/ErrorState';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateTask'>;

export function UpdateTaskScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const task = useTaskStore(state => state.getTaskById(taskId));
  const { updateMutation } = useTaskMutations();

  const initialValues = useMemo<TaskFormValues | undefined>(() => {
    if (!task) {
      return undefined;
    }
    return {
      title: task.title,
      description: task.description,
      completed: task.completed,
    };
  }, [task]);

  const handleSubmit = useCallback(
    async (values: TaskFormValues) => {
      try {
        await updateMutation.mutateAsync({ id: taskId, input: values });
        navigation.goBack();
      } catch (error) {
        Alert.alert(
          'Update failed',
          error instanceof Error ? error.message : 'Unable to update task.',
        );
      }
    },
    [navigation, taskId, updateMutation],
  );

  if (!task || !initialValues) {
    return (
      <ErrorState
        message="This task could not be found. It may have been deleted."
        onRetry={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TaskForm
        key={taskId}
        initialValues={initialValues}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        loading={updateMutation.isPending}
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
