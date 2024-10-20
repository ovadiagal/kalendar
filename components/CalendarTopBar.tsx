import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions, useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import type { FC } from 'react';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

interface HeaderProps {
  currentDate: SharedValue<string>;
  onPressToday?: () => void;
}

const Header: FC<HeaderProps> = ({ currentDate, onPressToday }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');

  const updateTitle = (date: string) => {
    const formatted = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    setTitle(formatted);
  };

  useAnimatedReaction(
    () => currentDate.value,
    (value) => {
      runOnJS(updateTitle)(value);
    },
    []
  );

  return (
    <View
      className="flex-row items-center px-3 pb-4 pt-4"
      style={{ backgroundColor: theme.colors.card }}>
      <View className="flex-grow flex-row items-center">
        <Text className="flex-grow text-lg font-medium" style={{ color: theme.colors.text }}>
          {title}
        </Text>
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={onPressToday}
          className="mr-4">
          <Ionicons name="sparkles-sharp" size={24} color="blueviolet" />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={onPressToday}>
          <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
