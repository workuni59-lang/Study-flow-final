const TIME_GREETINGS: Record<string, string[]> = {
  morning: [
    'Good morning, %s.',
    'Rise and shine, %s.',
    'Morning, %s. Let\'s make it count.',
    'A new day, a new focus session. Good morning, %s.',
    'The early bird gets the focus. Morning, %s.',
  ],
  afternoon: [
    'Good afternoon, %s.',
    'Hope your day\'s going well, %s.',
    'Afternoon focus time, %s.',
    'You\'ve made it this far. Keep going, %s.',
    'Perfect time to lock in, %s.',
  ],
  evening: [
    'Good evening, %s.',
    'Evening grind, %s. Let\'s go.',
    'Wind down or lock in — your call, %s.',
    'The night is young, %s. One more session?',
  ],
  night: [
    'Night, %s.',
    'Late night focus hits different, %s.',
    'Quiet hours. Deep focus. Let\'s go, %s.',
    'The world is asleep. Time to work, %s.',
    'Night owl mode engaged, %s.',
  ],
};

const DAY_GREETINGS: Record<number, string[]> = {
  0: [
    'Sunday reset, %s.',
    'Take it easy today, %s.',
    'Sunday vibes. Rest or grind, your call, %s.',
  ],
  1: [
    'New week, new wins. Let\'s go, %s.',
    'Monday motivation: you\'ve got this, %s.',
    'Time to set the tone for the week, %s.',
  ],
  2: [
    'Tuesday traction, %s.',
    'Keep the momentum going, %s.',
    'Tuesday\'s for building, %s.',
  ],
  3: [
    'Hump day, %s. You\'re halfway there.',
    'Wednesday wisdom: consistency beats intensity, %s.',
    'Midweek check-in. How\'s your focus, %s?',
  ],
  4: [
    'Thursday energy, %s.',
    'Almost there, %s. One more push.',
    'Thursday — the new Friday, %s.',
  ],
  5: [
    'Friday focus, %s. Finish strong.',
    'Weekend eve. Let\'s get it done, %s.',
    'Friday vibes. Lock in then log off, %s.',
  ],
  6: [
    'Saturday session, %s.',
    'Weekend warrior, %s.',
    'Saturday — perfect for deep work, %s.',
  ],
};

export function getGreeting(userName?: string): string {
  const name = userName || 'Student';
  const hour = new Date().getHours();
  const day = new Date().getDay();

  let timeKey: string;
  if (hour < 5) timeKey = 'night';
  else if (hour < 12) timeKey = 'morning';
  else if (hour < 17) timeKey = 'afternoon';
  else if (hour < 21) timeKey = 'evening';
  else timeKey = 'night';

  const timeGreetings = TIME_GREETINGS[timeKey];
  const dayGreetings = DAY_GREETINGS[day];

  const pool = [...timeGreetings, ...dayGreetings];
  const seed = (hour + day + new Date().getDate()) % pool.length;
  return pool[seed].replace('%s', name);
}
