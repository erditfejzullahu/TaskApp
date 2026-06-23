import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { colors, spacing, typography } from '@/theme';
import { TasksScreen } from '@/screens/TasksScreen';
import { CreateTaskScreen } from '@/screens/CreateTaskScreen';
import { UpdateTaskScreen } from '@/screens/UpdateTaskScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: {
          ...typography.h3,
          color: colors.text,
        },
        headerShadowVisible: true,
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonMenuEnabled: false,
      }}>
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: 'TaskNow' }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'New Task' }}
      />
      <Stack.Screen
        name="UpdateTask"
        component={UpdateTaskScreen}
        options={{ title: 'Edit Task' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
  },
});
