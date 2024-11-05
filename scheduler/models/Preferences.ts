export interface Preferences {
  // User ID who has the preferences
  userId: string;

  // WORKDAY PREFERENCES -> These should take priority over the break preferences
  /** Workday hours mapped by each day of the week, each item contains start time, end time, and productive times */
  days: {
    day: string; // e.g., 'Mon', 'Tue', etc.
    start_time: string; // e.g., '9AM'
    end_time: string; // e.g., '5PM'
    productive_times: string[]; // e.g., ['9AM - 12PM', '2PM - 4PM']
  }[];

  // BREAK PREFERENCES
  /** Preferred break time in minutes */
  breakTimeMinutes: number;

  /** Number of breaks the user prefers */
  numberOfBreaks: number; // e.g., 4 (4 breaks during the day)

  /** Activities that the user wants to do during their break time */
  selectedActivities: string[]; // e.g., ['Short walk', 'Meditation', 'Work out']

  /** Any preference modifications from the user */
  preferenceModifications: object; // User input on modifications they want to make to the provided preferences
}
