import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
  className?: string;
  textClassName?: string;
  uppercase?: boolean;
}

const Divider: React.FC<DividerProps> = ({ text, className, textClassName, uppercase }) => {
  return (
    <View className={`flex-row items-center ${className}`}>
      <View className="h-px flex-1 bg-gray-300" />
      {text && (
        <Text className={`mx-4 text-gray-500 ${uppercase ? 'uppercase' : ''} ${textClassName}`}>
          {text}
        </Text>
      )}
      <View className="h-px flex-1 bg-gray-300" />
    </View>
  );
};

export default Divider;
