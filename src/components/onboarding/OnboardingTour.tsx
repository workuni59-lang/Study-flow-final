import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_KEY = 'sf_tour_done';

const STEPS: DriveStep[] = [
  {
    element: '#tour-home-tab',
    popover: {
      title: 'Your Dashboard',
      description: 'This is your home base — see your clock, daily quote, and study stats at a glance.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-focus-tab',
    popover: {
      title: 'Focus Mode',
      description: 'Enter a distraction-free timer session with ambient sounds and wallpapers.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-clock-area',
    popover: {
      title: 'Daily Overview',
      description: 'Your personalized greeting and motivational quote refresh every day.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-customize-btn',
    popover: {
      title: 'Make It Yours',
      description: 'Change your wallpaper, clock style, atmosphere color, and ambient sounds here.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#tour-daily-goal',
    popover: {
      title: 'Daily Goal',
      description: 'Track your study progress toward your daily focus goal.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-stats-bar',
    popover: {
      title: 'Your Stats',
      description: 'Your session time, daily streak, and XP earned from studying.',
      side: 'bottom',
      align: 'center',
    },
  },
];

function createDriver() {
  return driver({
    animate: true,
    overlayOpacity: 0.75,
    stagePadding: 10,
    overlayClickBehavior: 'nextStep',
    doneBtnText: 'Done',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    steps: STEPS,
    onDestroyed: () => {
      localStorage.setItem(TOUR_KEY, 'true');
    },
  });
}

let manualDriver: ReturnType<typeof driver> | null = null;

export function startTour() {
  if (manualDriver?.isActive()) return;
  manualDriver = createDriver();
  manualDriver.drive();
}

export const OnboardingTour = () => {
  return null;
};
