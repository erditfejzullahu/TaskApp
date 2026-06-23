import React, { memo } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AppIconProps {
  name: IoniconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const AppIcon = memo(function AppIcon({
  name,
  size = 20,
  color,
  style,
}: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
});
