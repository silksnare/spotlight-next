'use client'

import { useEffect, useState } from 'react'

const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const seconds = totalSeconds % 60

  return [days, hours, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export default function CountdownTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(THREE_DAYS_IN_SECONDS)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((previous) => (previous > 0 ? previous - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500">
      <span className="font-semibold text-gray-700">{formatCountdown(remainingSeconds)}</span>
      <span>Until Program Start</span>
    </div>
  )
}
