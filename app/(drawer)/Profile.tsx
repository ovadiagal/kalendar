import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useSupabase } from '../context/useSupabase';
import { UserPen } from 'lucide-react-native';
import TimeEditor from '~/components/TimeEditor';
import RemoteWorkEditor from '~/components/RemoteWorkEditor';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';


const Profile = () => {
  const router = useRouter();
  const { supabase, userId } = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [workPreferences, setWorkPreferences] = useState({
    days: [] as Array<{
      day: string;
      workday_start_time: string;
      workday_end_time: string;
      is_remote_workday: boolean | null;
    }>,
    currentDay: 'M'
  });
  const [breakPreferences, setBreakPreferences] = useState({
    breakTime: '',
    numberOfBreaks: '',
    selectedActivities: [] as string[],
    customActivities: [] as string[]
  });
  const [freeformPreferences, setFreeformPreferences] = useState({
    workPreferences: '',
    breakPreferences: '',
    additionalPreferences: ''
  });

  const days = ['M', 'T', 'W', 'Th', 'F'];
  const dayNames = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    Th: 'Thursday',
    F: 'Friday'
  };

  const defaultActivities = ['Short walks', 'Meditation', 'Social break', 'Eating snacks'];
  const breakOptions = [
    { label: 'Short (< 15 min)', value: 'short' },
    { label: 'Mid (15-30 min)', value: 'medium' },
    { label: 'Long (30-60 min)', value: 'long' },
    { label: 'Dedicated (> 1 hr)', value: 'dedicated' }
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchPreferences();
    }, [])
  );

  const fetchPreferences = async () => {
    try {
      setLoading(true);

      const { data: workData } = await supabase
        .from('work_preferences_updated')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      const { data: breakData } = await supabase
        .from('break_preferences_updated')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      const { data: freeformData } = await supabase
        .from('freeform_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);


      setWorkPreferences({
        days: workData[0].days.map(day => ({
          ...day,
          is_remote_workday: day.is_remote_workday ?? null
        })),
        currentDay: 'M'
      });

      const activities = breakData?.[0]?.selected_activities?.split(',') || [];
      const defaultActivities = ['Short walks', 'Meditation', 'Social break', 'Eating snacks'];
      setBreakPreferences({
        breakTime: breakData?.[0]?.break_time || '',
        numberOfBreaks: breakData?.[0]?.number_of_breaks || '',
        selectedActivities: activities,
        customActivities: activities.filter(activity => !defaultActivities.includes(activity))
      });

      setFreeformPreferences(JSON.parse(freeformData[0].preference_modifications));
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await supabase.from('work_preferences_updated').insert({
        user_id: userId,
        days: workPreferences.days,
        updated_at: new Date().toISOString()
      });
      await supabase.from('break_preferences_updated').insert({
        user_id: userId,
        break_time: breakPreferences.breakTime,
        number_of_breaks: breakPreferences.numberOfBreaks,
        selected_activities: breakPreferences.selectedActivities.join(','),
        updated_at: new Date().toISOString()
      });
      await supabase.from('freeform_preferences').insert({
        user_id: userId,
        preference_modifications: JSON.stringify(freeformPreferences),
        updated_at: new Date().toISOString()
      });

      setIsEditing(false);
      router.push('/Calendar');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleWorkTimeChange = (day: string, type: 'start' | 'end', date: Date) => {
    setWorkPreferences(prev => ({
      ...prev,
      days: prev.days.map(dayData => {
        if (dayData.day === day) {
          return {
            ...dayData,
            [`workday_${type}_time`]: date.toISOString()
          };
        }
        return dayData;
      })
    }));
  };

  const handleRemoteChange = (day: string, isRemote: boolean) => {
    setWorkPreferences(prev => ({
      ...prev,
      days: prev.days.map(dayData => {
        if (dayData.day === day) {
          return {
            ...dayData,
            is_remote_workday: isRemote
          };
        }
        return dayData;
      })
    }));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="mr-2 text-3xl font-bold mr-2i">Your Profile</Text>
              <UserPen strokeWidth={2} />
            </View>
            <TouchableOpacity
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              className="rounded-lg bg-accentPurple px-4 py-2">
              <Text className="font-semibold text-white">
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-4 text-lg font-semibold">Work Profile</Text>
            <View className="mb-4 flex-row justify-between">
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setWorkPreferences(prev => ({ ...prev, currentDay: day }))}
                  className={`h-10 w-10 items-center justify-center rounded-full
                    ${workPreferences.currentDay === day ? 'bg-accentPurple' : 'bg-gray-100'}`}>
                  <Text className={`font-bold
                    ${workPreferences.currentDay === day ? 'text-white' : 'text-gray-600'}`}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mb-2 font-medium text-lg text-gray-800">
              {dayNames[workPreferences.currentDay]}
            </Text>

            {workPreferences.days.map((dayData, index) => {
              if (dayData.day === workPreferences.currentDay) {
                return (
                  <React.Fragment key={index}>
                    <TimeEditor
                      dayData={dayData}
                      isEditing={isEditing}
                      onTimeChange={(type, date) => handleWorkTimeChange(dayData.day, type, date)}
                    />
                    <RemoteWorkEditor
                      isRemote={dayData.is_remote_workday}
                      isEditing={isEditing}
                      onRemoteChange={(isRemote) => handleRemoteChange(dayData.day, isRemote)}
                    />
                  </React.Fragment>
                );
              }
              return null;
            })}
          </View>

          <View className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-4 text-lg font-semibold">Break Profile</Text>
            <View className="space-y-4">
              <View className="mb-2">
                <Text className="mb-2 font-medium text-gray-800">Break Duration:</Text>
                {isEditing ? (
                  <View className="flex-row flex-wrap">
                    {breakOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setBreakPreferences(prev => ({
                          ...prev,
                          breakTime: option.label
                        }))}
                        className={`mr-2 mb-2 rounded-lg p-2
                          ${breakPreferences.breakTime === option.label
                            ? 'bg-accentPurple'
                            : 'bg-gray-100'}`}>
                        <Text className={`
                          ${breakPreferences.breakTime === option.label
                            ? 'text-white'
                            : 'text-gray-600'}`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="mb-4 text-gray-700">{breakPreferences.breakTime}</Text>
                )}
              </View>

              <View className="mb-2">
                <Text className="mb-2 font-medium text-gray-800">Number of Breaks:</Text>
                {isEditing ? (
                  <TextInput
                    value={breakPreferences.numberOfBreaks}
                    onChangeText={(text) => setBreakPreferences(prev => ({
                      ...prev,
                      numberOfBreaks: text
                    }))}
                    keyboardType="numeric"
                    className="rounded-lg border border-gray-200 p-2 mb-2"
                  />
                ) : (
                  <Text className="mb-4 text-gray-700">{breakPreferences.numberOfBreaks}</Text>
                )}
              </View>

              <View>
                <Text className="mb-2 font-medium text-gray-800">Activities:</Text>
                {isEditing ? (
                  <View className="flex-row flex-wrap">
                    {defaultActivities.map((activity) => (
                      <TouchableOpacity
                        key={activity}
                        onPress={() => {
                          const activities = breakPreferences.selectedActivities;
                          const newActivities = activities.includes(activity)
                            ? activities.filter(a => a !== activity)
                            : [...activities, activity];
                          setBreakPreferences(prev => ({
                            ...prev,
                            selectedActivities: newActivities
                          }));
                        }}
                        className={`mr-2 mb-2 rounded-lg p-2
                          ${breakPreferences.selectedActivities.includes(activity)
                            ? 'bg-accentPurple'
                            : 'bg-gray-100'}`}>
                        <Text className={`
                          ${breakPreferences.selectedActivities.includes(activity)
                            ? 'text-white'
                            : 'text-gray-600'}`}>
                          {activity}
                        </Text>
                      </TouchableOpacity>
                    ))}
        
                      {/* Custom Activities */}
                      {breakPreferences.customActivities.map((activity) => (
                        <TouchableOpacity
                          key={activity}
                          onPress={() => {
                            const activities = breakPreferences.selectedActivities;
                            const newActivities = activities.includes(activity)
                              ? activities.filter(a => a !== activity)
                              : [...activities, activity];
                            setBreakPreferences(prev => ({
                              ...prev,
                              selectedActivities: newActivities
                            }));
                          }}
                          className={`mr-2 mb-2 rounded-lg p-2
                            ${breakPreferences.selectedActivities.includes(activity)
                              ? 'bg-accentPurple'
                              : 'bg-gray-100'}`}>
                          <Text className={`
                            ${breakPreferences.selectedActivities.includes(activity)
                              ? 'text-white'
                              : 'text-gray-600'}`}>
                            {activity}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                ) : (
                  <View>
                    <Text className="text-gray-700">
                      Default activities: {breakPreferences.selectedActivities
                        .filter(activity => defaultActivities.includes(activity))
                        .join(', ')}
                    </Text>
                    {breakPreferences.selectedActivities
                      .filter(activity => !defaultActivities.includes(activity))
                      .length > 0 && (
                      <Text className="mt-2 text-gray-700">
                        Custom activities: {breakPreferences.selectedActivities
                          .filter(activity => !defaultActivities.includes(activity))
                          .join(', ')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold">Additional Work Preferences</Text>
            {isEditing ? (
              <TextInput
                value={freeformPreferences.workPreferences}
                onChangeText={(text) => setFreeformPreferences(prev => ({ ...prev, workPreferences: text }))}
                className="rounded-lg border border-gray-200 p-2"
                multiline
              />
            ) : (
              <Text className="text-gray-700">{freeformPreferences.workPreferences}</Text>
            )}
          </View>

          <View className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold">Additional Break Preferences</Text>
            {isEditing ? (
              <TextInput
                value={freeformPreferences.breakPreferences}
                onChangeText={(text) => setFreeformPreferences(prev => ({ ...prev, breakPreferences: text }))}
                className="rounded-lg border border-gray-200 p-2"
                multiline
              />
            ) : (
              <Text className="text-gray-700">{freeformPreferences.breakPreferences}</Text>
            )}
          </View>

          <View className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold">Additional Custom Preferences</Text>
            {isEditing ? (
              <TextInput
                value={freeformPreferences.additionalPreferences}
                onChangeText={(text) => setFreeformPreferences(prev => ({ ...prev, additionalPreferences: text }))}
                className="rounded-lg border border-gray-200 p-2"
                multiline
              />
            ) : (
              <Text className="text-gray-700">{freeformPreferences.additionalPreferences}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
