import { useRef, useState, useEffect } from 'react';

export function useUserActivity(inactivityTime = 3000) {
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];

    const resetTimer = () => {
      setIsActive(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsActive(false);
      }, inactivityTime);
    };

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer on mount

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inactivityTime]);

  return isActive;
}
