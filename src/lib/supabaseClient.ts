import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// No alcanza con que las variables existan: si la URL está mal formada
// (sin esquema, con comillas pegadas), createClient tira una excepción durante
// el import del módulo, antes de que React monte nada. Ni el ErrorBoundary ni
// la pantalla de configuración llegarían a verse: volvería la pantalla en
// blanco. Por eso se valida acá y el cliente se crea siempre con algo válido.
function urlValida(valor: string | undefined): valor is string {
  if (!valor) return false
  try {
    const u = new URL(valor)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = urlValida(url) && Boolean(anonKey)

// Sin el genérico Database: los tipos de fila vienen de src/types/domain.ts
// en cada capa de acceso a datos (mealsApi, feelingsApi, foodsApi), en vez de
// depender de que el generador de Supabase coincida exactamente con las
// migraciones a mano. Si generás database.types.ts con el CLI de Supabase
// (ver README), podés volver a tipar el cliente con createClient<Database>(...).
//
// Si la configuración no sirve usamos valores placeholder en vez de tirar un
// error: así la app puede montar un mensaje explicativo en pantalla en vez de
// quedar en blanco por una excepción sin capturar al importar el módulo.
export const supabase = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? anonKey : 'placeholder-anon-key',
)
