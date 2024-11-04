import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import type { FC } from 'react';
import React, { useState } from 'react';
import { Text, Alert, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { useSupabase } from '../app/context/useSupabase';
import { Database } from '../database.types';
import FeedbackModal from './FeedbackModal';

interface CalendarTopBarProps {
  currentDate: SharedValue<string>;
  onPressToday: () => void;
  runScheduler: () => void;
  loading: boolean;
}

const CalendarTopBar: FC<CalendarTopBarProps> = ({
  currentDate,
  onPressToday,
  runScheduler,
  loading,
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<'thumbs up' | 'thumbs down' | null>(
    null
  );
  const { supabase, userId } = useSupabase();

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

  const handleFeedbackSubmit = async () => {
    if (!selectedFeedback) return;

    const newFeedback: Database['public']['Tables']['scheduler_feedback']['Insert'] = {
      user_id: userId,
      thumbs_value: selectedFeedback,
      optional_feedback: feedbackText,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('scheduler_feedback').insert(newFeedback);

    if (error) {
      console.error('Error saving user feedback:', error.message);
      Alert.alert('Error', 'Failed to save user feedback data. Please try again.');
    } else {
      console.log('saved user feedback: ', newFeedback);
    }

    setModalVisible(false);
    setFeedbackText('');
    setSelectedFeedback(null);
  };

  const openModal = () => {
    setSelectedFeedback(null);
    setFeedbackText('');
    setModalVisible(true);
  };

  return (
    <View
      className="flex-row items-center px-3 pb-4 pt-4"
      style={{ backgroundColor: theme.colors.card }}>
      <View className="flex-grow flex-row items-center">
        <Text className="text-lg font-medium" style={{ color: theme.colors.text }}>
          {title}
        </Text>
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={openModal}
          className="ml-2">
          <MaterialCommunityIcons name="thumb-up" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View className="flex-grow" />
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={runScheduler}
          disabled={loading}
          className="ml-4">
          {loading ? (
            <ActivityIndicator size="small" color="blueviolet" />
          ) : (
            <Ionicons name="sparkles-sharp" size={24} color="blueviolet" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={onPressToday}>
          <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <FeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedFeedback={selectedFeedback}
        setSelectedFeedback={setSelectedFeedback}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
        handleFeedbackSubmit={handleFeedbackSubmit}
      />
    </View>
  );
};

export default CalendarTopBar;
