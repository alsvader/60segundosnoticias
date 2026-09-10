const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/**
 * The only place editorial dates are formatted. Consumed from the view
 * models (Section 4), never from a component directly, so no component
 * configures its own Intl.DateTimeFormat.
 */
export function formatShortDate(date: string | Date): string {
  return SHORT_DATE_FORMATTER.format(new Date(date))
}

export function formatLongDate(date: string | Date): string {
  return LONG_DATE_FORMATTER.format(new Date(date))
}
