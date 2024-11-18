import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text } from 'react-native';

const TimeEditor = ({ 
  dayData, 
  isEditing, 
  onTimeChange 
}: { 
  dayData: any;
  isEditing: boolean;
  onTimeChange: (type: 'start' | 'end', date: Date) => void;
}) => {
  if (!isEditing) {
    return (
      <View className="space-y-2">
        <Text className="text-m text-gray-800">Work Hours:</Text>
        <Text className="text-gray-700">
          {new Date(dayData.workday_start_time).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })} - {' '}
          {new Date(dayData.workday_end_time).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-medium text-gray-700">Start Time</Text>
        <View className="flex-1">
          <DateTimePicker
            value={new Date(dayData.workday_start_time)}
            mode="time"
            is24Hour={false}
            onChange={(event, date) => {
              if (date) onTimeChange('start', date);
            }}
            style={{ width: 100 }}
          />
        </View>
      </View>
      
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-medium text-gray-700">End Time</Text>
        <View className="flex-1">
          <DateTimePicker
            value={new Date(dayData.workday_end_time)}
            mode="time"
            is24Hour={false}
            onChange={(event, date) => {
              if (date) onTimeChange('end', date);
            }}
            style={{ width: 100 }}
          />
        </View>
      </View>
    </View>
  );
};

export default TimeEditor;