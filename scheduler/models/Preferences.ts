export interface Preferences {
  // User ID who has the preferences
  userId: string;

  // WORKDAY PREFERENCES -> These should take priority over the break preferences
  /**Workday start time and end time */
  startTime: string; // e.g., 2024-10-30T23:40:00+00:00
  endTime: string; // e.g., 2024-10-30T23:40:00+00:00

  /**Days of the week that the user works remotely */
  selectedDays: string[]; // e.g., ['M', 'T', 'W', 'Th', 'F']

  /**Times of the day that the user focuses the best */
  selectedTimes: string[]; // e.g., ['6AM - 9AM']

  // BREAK PREFERENCES
  /**Preferred break time in minutes */
  breakTimeMinutes: number;

  /**Times the user doesn't want to be online for work */
  offlineTimes: string[]; // e.g., ['12:00', '18:00']

  /**Activities that the user wants to do during their break time */
  selectedActivities: string[]; // e.g., ['Short walks']

  // Preference modifications
  preferenceModifications: string; // User input on modifications they want to make to the provided preferences. These have high priority.
}
