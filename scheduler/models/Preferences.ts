export interface Preferences {
  userId: string;
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '17:00'
  selectedDays: string[]; // e.g., ['M', 'T', 'W', 'Th', 'F']
  selectedTimes: string[]; // e.g., ['6AM - 9AM']
  breakTimeMinutes: number;
  offlineTimes: string[]; // e.g., ['12:00', '18:00']
  selectedActivities: string[]; // e.g., ['Short walks']
}
