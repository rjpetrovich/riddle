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

/**
 * Clave de día en hora local (YYYY-MM-DD).
 *
 * A propósito no usa toISOString(), que trabaja en UTC: una cena de las 22:00
 * en UTC-3 caería en el día siguiente y aparecería en la casilla equivocada del
 * calendario.
 */
export function claveDiaLocal(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}
