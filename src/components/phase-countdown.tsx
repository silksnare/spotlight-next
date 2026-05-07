'use client';

import { useEffect, useMemo, useState } from 'react';

type PhaseCountdownProps = {
  message: string;
  targetDate: string;
};

function getTimeRemaining(targetDate: string) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    total: diff,
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function PhaseCountdown({
  message,
  targetDate,
}: PhaseCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const display = useMemo(
    () =>
      `${timeLeft.days}:${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`,
    [timeLeft]
  );

  return (
    <div className="rounded-xl py-2 text-sm">
      <div className="font-medium">{message}</div>
      <div className="tabular-nums text-[22px] font-bold">{display}</div>
    </div>
  );
}
