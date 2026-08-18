import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatHora(iso: string): string {
  return format(parseISO(iso), 'HH:mm')
}

export function formatFechaCorta(iso: string): string {
  const date = parseISO(iso)
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  return format(date, "d 'de' MMMM", { locale: es })
}

export function formatFechaHora(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es })
}

export function nowLocalInputValue(): string {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function dateKey(iso: string): string {
  return parseISO(iso).toISOString().slice(0, 10)
}
