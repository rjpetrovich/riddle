import { supabase } from '../../lib/supabaseClient'

interface FilaExport {
  fecha_hora: string
  tipo: string
  nombre: string
  ingredientes_o_sintomas: string
  valoracion: string
  intensidad: string
  notas: string
}

export async function exportarHistorialCsv(usuarioId: string) {
  const [{ data: comidas, error: errComidas }, { data: sensaciones, error: errSensaciones }] =
    await Promise.all([
      supabase
        .from('comidas')
        .select('fecha_hora, tipo_comida, nombre, notas, comida_alimentos(alimentos_catalogo(nombre))')
        .eq('usuario_id', usuarioId)
        .order('fecha_hora'),
      supabase
        .from('sensaciones')
        .select('fecha_hora, valoracion, intensidad, notas, sensacion_sintomas(sintomas_catalogo(nombre))')
        .eq('usuario_id', usuarioId)
        .order('fecha_hora'),
    ])

  if (errComidas) throw errComidas
  if (errSensaciones) throw errSensaciones

  const filas: FilaExport[] = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(comidas ?? []).map((c: any) => ({
      fecha_hora: c.fecha_hora,
      tipo: 'comida',
      nombre: `${c.tipo_comida}: ${c.nombre}`,
      ingredientes_o_sintomas: (c.comida_alimentos ?? [])
        .map((ca: any) => ca.alimentos_catalogo?.nombre)
        .filter(Boolean)
        .join('; '),
      valoracion: '',
      intensidad: '',
      notas: c.notas ?? '',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(sensaciones ?? []).map((s: any) => ({
      fecha_hora: s.fecha_hora,
      tipo: 'sensacion',
      nombre: '',
      ingredientes_o_sintomas: (s.sensacion_sintomas ?? [])
        .map((ss: any) => ss.sintomas_catalogo?.nombre)
        .filter(Boolean)
        .join('; '),
      valoracion: s.valoracion,
      intensidad: s.intensidad ?? '',
      notas: s.notas ?? '',
    })),
  ].sort((a, b) => (a.fecha_hora < b.fecha_hora ? -1 : 1))

  // Se carga acá y no arriba: exportar es algo puntual, no hace falta que la
  // librería viaje en el arranque de la app.
  const { default: Papa } = await import('papaparse')
  const csv = Papa.unparse(filas)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `como-me-cae-historial-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
