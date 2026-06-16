import { useState, useEffect } from 'react';

export function useBlink() {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const scheduleBlink = () => {
      const nextBlink = 2000 + Math.random() * 4000;
      
      const timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 120);
      }, nextBlink);

      return timeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  return isBlinking;
}
