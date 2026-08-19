/**
 * Texto legible de un error, venga de donde venga.
 *
 * Los errores de Supabase no son instancias de Error sino objetos planos
 * ({ message, code, hint, details }), así que un String(error) los convierte en
 * "[object Object]" y esconde justamente el dato que sirve para diagnosticar.
 */
export function mensajeDeError(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message

  if (typeof error === 'object') {
    const e = error as { message?: unknown; hint?: unknown; code?: unknown }
    const partes: string[] = []
    if (typeof e.message === 'string' && e.message) partes.push(e.message)
    if (typeof e.hint === 'string' && e.hint) partes.push(e.hint)
    if (partes.length > 0) {
      const codigo = typeof e.code === 'string' && e.code ? ` (${e.code})` : ''
      return partes.join(' — ') + codigo
    }
    try {
      return JSON.stringify(error)
    } catch {
      return 'error desconocido'
    }
  }

  return String(error)
}
