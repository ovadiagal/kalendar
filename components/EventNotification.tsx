import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { EventItem } from '@howljs/calendar-kit';
import { X, Clock, Check, XCircle } from 'lucide-react-native';

interface NotificationProps {
  events: EventItem[];
  onEventUpdate: (updatedEvent: EventItem, action: 'delay' | 'cancel' | 'keep') => void;
}

interface UpcomingEvent extends EventItem {
  timeUntilStart: number;
}

export const EventNotification: React.FC<NotificationProps> = ({ events, onEventUpdate }) => {
  const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent | null>(null);
  const [slideAnim] = useState(new Animated.Value(-150));
  const [isExpanded, setIsExpanded] = useState(false);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const personalEvents = events.filter(event => event.draggable);
    
    // Find the next personal event within 15 minutes
    const next = personalEvents
      .map(event => {
        if (!event.start.dateTime) return null;
        const startTime = new Date(event.start.dateTime);
        const timeUntilStart = startTime.getTime() - now.getTime();
        
        if (timeUntilStart > 0 && timeUntilStart <= 15 * 60 * 1000) {
          return {
            ...event,
            timeUntilStart
          };
        }
        return null;
      })
      .filter((event): event is UpcomingEvent => 
        event !== null
      )
      .sort((a, b) => a.timeUntilStart - b.timeUntilStart)[0];

    setUpcomingEvent(next || null);
  };

  const handleAction = (action: 'delay' | 'cancel' | 'keep') => {
    if (!upcomingEvent) return;

    let updatedEvent: EventItem;

    switch (action) {
      case 'delay':
        // Create new event with 15 minutes delay
        if (upcomingEvent.start.dateTime && upcomingEvent.end.dateTime) {
          const newStartTime = new Date(upcomingEvent.start.dateTime);
          const newEndTime = new Date(upcomingEvent.end.dateTime);
          newStartTime.setMinutes(newStartTime.getMinutes() + 15);
          newEndTime.setMinutes(newEndTime.getMinutes() + 15);
          
          updatedEvent = {
            ...upcomingEvent,
            start: { dateTime: newStartTime.toISOString() },
            end: { dateTime: newEndTime.toISOString() }
          };
        } else {
          updatedEvent = upcomingEvent;
        }
        break;
      
      case 'cancel':
        updatedEvent = upcomingEvent;
        break;
      
      case 'keep':
        updatedEvent = upcomingEvent;
        break;
    }

    onEventUpdate(updatedEvent, action);
    hideNotification();
  };

  const showNotification = () => {
    setIsExpanded(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const hideNotification = () => {
    Animated.spring(slideAnim, {
      toValue: -150,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
    });
  };

  // Check for upcoming events every minute or when events change
  useEffect(() => {
    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 60000);
    return () => clearInterval(interval);
  }, [events]);

  useEffect(() => {
    if (upcomingEvent) {
      showNotification();
    } else {
      hideNotification();
    }
  }, [upcomingEvent]);

  if (!upcomingEvent) return null;

  return (
    <Animated.View
      className="absolute left-0 right-0 top-0 z-50 mx-4 mt-2 rounded-lg bg-accentPurple shadow-lg"
      style={{
        transform: [{ translateY: slideAnim }],
      }}>
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{upcomingEvent.title}</Text>
            <Text className="text-white">
              Starting in {Math.ceil(upcomingEvent.timeUntilStart / (60 * 1000))} minutes
            </Text>
          </View>
          <TouchableOpacity
            onPress={hideNotification}
            className="ml-2 rounded-full bg-white/20 p-2"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <X size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row justify-around">
          <TouchableOpacity
            onPress={() => handleAction('delay')}
            className="flex-1 flex-row items-center justify-center rounded-lg bg-white/20 p-3 mx-1">
            <Clock size={16} color="white" strokeWidth={2} />
            <Text className="ml-2 text-white font-semibold">Delay 15m</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAction('keep')}
            className="flex-1 flex-row items-center justify-center rounded-lg bg-white/20 p-3 mx-1">
            <Check size={16} color="white" strokeWidth={2} />
            <Text className="ml-2 text-white font-semibold">Keep</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAction('cancel')}
            className="flex-1 flex-row items-center justify-center rounded-lg bg-white/20 p-3 mx-1">
            <XCircle size={16} color="white" strokeWidth={2} />
            <Text className="ml-2 text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};