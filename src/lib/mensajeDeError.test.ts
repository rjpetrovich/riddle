import { describe, expect, it } from 'vitest'
import { mensajeDeError } from './mensajeDeError'

describe('mensajeDeError', () => {
  it('extrae el mensaje de un error de Supabase, que no es instancia de Error', () => {
    // Este era el bug: String(objeto) daba "[object Object]" y escondía la
    // única información útil para diagnosticar.
    const error = {
      message: "Could not find the table 'public.contadores_dia' in the schema cache",
      code: 'PGRST205',
      hint: null,
      details: null,
    }
    expect(mensajeDeError(error)).toContain('contadores_dia')
    expect(mensajeDeError(error)).toContain('PGRST205')
    expect(mensajeDeError(error)).not.toContain('[object Object]')
  })

  it('suma la pista cuando el servidor la manda', () => {
    expect(mensajeDeError({ message: 'permiso denegado', hint: 'revisá los GRANT' })).toBe(
      'permiso denegado — revisá los GRANT',
    )
  })

  it('usa el mensaje de un Error normal', () => {
    expect(mensajeDeError(new Error('se cayó la red'))).toBe('se cayó la red')
  })

  it('deja pasar un string tal cual', () => {
    expect(mensajeDeError('algo falló')).toBe('algo falló')
  })

  it('no rompe con null ni undefined', () => {
    expect(mensajeDeError(null)).toBe('')
    expect(mensajeDeError(undefined)).toBe('')
  })

  it('serializa un objeto sin message en vez de mostrar [object Object]', () => {
    expect(mensajeDeError({ raro: 1 })).toBe('{"raro":1}')
  })

  it('sobrevive a un objeto con referencias circulares', () => {
    const circular: Record<string, unknown> = {}
    circular.yo = circular
    expect(mensajeDeError(circular)).toBe('error desconocido')
  })
})
