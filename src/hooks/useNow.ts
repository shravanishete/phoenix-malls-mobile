import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

export function useNow(intervalMs = 60_000): DateTime {
  const [now, setNow] = useState(() => DateTime.now())

  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}