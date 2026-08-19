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

/**
 * Devuelve el Date del mediodía de una clave YYYY-MM-DD, o null si no es válida.
 *
 * Se usa el mediodía y no la medianoche para que un cambio de horario de verano
 * no corra el día hacia atrás. Rechaza fechas que no existen (2025-02-31), que
 * el constructor de Date convertiría en silencio al mes siguiente.
 */
export function diaDesdeClave(clave: string | null | undefined): Date | null {
  if (!clave || !/^\d{4}-\d{2}-\d{2}$/.test(clave)) return null
  const [anio, mes, dia] = clave.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia, 12, 0, 0, 0)
  if (d.getFullYear() !== anio || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null
  return d
}

/**
 * Valor para <input type="datetime-local"> ubicado en el día que se pide, con
 * la hora actual. Así, al agregar una comida desde un día ya elegido en el
 * calendario, solo queda ajustar la hora. Sin clave válida, cae en "ahora".
 */
export function inputValueParaDia(clave: string | null | undefined): string {
  const ahora = nowLocalInputValue()
  return diaDesdeClave(clave) ? `${clave}T${ahora.slice(11, 16)}` : ahora
}
