import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const RemoteWorkEditor = ({ 
  isRemote,
  isEditing,
  onRemoteChange
}: {
  isRemote: boolean | null;
  isEditing: boolean;
  onRemoteChange: (isRemote: boolean) => void;
}) => {
  if (!isEditing) {
    return (
      <View className="mt-4">
        <Text className="text-m text-gray-800">Work Type:</Text>
        <Text className="text-gray-700">
          {isRemote === null ? 'Not set' : isRemote ? 'Remote' : 'In-office'}
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <Text className="mb-2 text-m text-gray-700">Work Type</Text>
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onRemoteChange(true)}
          className={`flex-1 rounded-lg p-2 mr-2
            ${isRemote === true ? 'bg-accentPurple' : 'bg-gray-100'}`}>
          <Text className={`text-center
            ${isRemote === true ? 'text-white' : 'text-gray-600'}`}>
            Remote
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemoteChange(false)}
          className={`flex-1 rounded-lg p-2
            ${isRemote === false ? 'bg-accentPurple' : 'bg-gray-100'}`}>
          <Text className={`text-center
            ${isRemote === false ? 'text-white' : 'text-gray-600'}`}>
            In-office
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RemoteWorkEditor;