import { CalendarBody, CalendarContainer, CalendarHeader } from '@howljs/calendar-kit';
import React from 'react';
import { View, ScrollView, Text } from 'react-native';

const Calendar = () => {
  return (
    <CalendarContainer>
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};

export default Calendar;
