import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React, { FC } from 'react';
import { Modal, Text, TouchableOpacity, View, TextInput } from 'react-native';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFeedback: 'thumbs up' | 'thumbs down' | null;
  setSelectedFeedback: (feedback: 'thumbs up' | 'thumbs down' | null) => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  handleFeedbackSubmit: () => Promise<void>;
}

const FeedbackModal: FC<FeedbackModalProps> = ({
  visible,
  onClose,
  selectedFeedback,
  setSelectedFeedback,
  feedbackText,
  setFeedbackText,
  handleFeedbackSubmit,
}) => {
  const theme = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <BlurView intensity={50} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          className="w-72 items-center rounded-lg bg-white p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
          <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text className="mb-2 text-lg font-bold">Feedback</Text>
          <Text className="mb-4">Did you find this helpful?</Text>
          <View className="mb-4 w-full flex-row justify-center">
            <TouchableOpacity className="mx-2 p-2" onPress={() => setSelectedFeedback('thumbs up')}>
              <MaterialCommunityIcons
                name="thumb-up"
                size={24}
                color={selectedFeedback === 'thumbs up' ? 'green' : 'gray'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="mx-2 p-2"
              onPress={() => setSelectedFeedback('thumbs down')}>
              <MaterialCommunityIcons
                name="thumb-down"
                size={24}
                color={selectedFeedback === 'thumbs down' ? 'red' : 'gray'}
              />
            </TouchableOpacity>
          </View>
          <TextInput
            className="mb-4 h-24 w-full rounded-lg border border-gray-300 p-2"
            placeholder="Any additional comments to improve your scheduling algorithm"
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity onPress={handleFeedbackSubmit} className="mt-2">
            <Text className="text-blue-500">Submit</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

export default FeedbackModal;
