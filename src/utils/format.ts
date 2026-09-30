import { DateTime } from 'luxon'


export function formatTime12h(time: string): string | null {
  const parsed = DateTime.fromFormat(time, 'HH:mm', { locale: 'en-US' })
  return parsed.isValid ? parsed.toFormat('h:mm a') : null
}

export function formatHoursRange(open: string, close: string): string | null {
  const openText = formatTime12h(open)
  const closeText = formatTime12h(close)
  return openText && closeText ? `${openText} – ${closeText}` : null
}