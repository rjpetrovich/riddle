import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Sin el genérico Database: los tipos de fila vienen de src/types/domain.ts
// en cada capa de acceso a datos (mealsApi, feelingsApi, foodsApi), en vez de
// depender de que el generador de Supabase coincida exactamente con las
// migraciones a mano. Si generás database.types.ts con el CLI de Supabase
// (ver README), podés volver a tipar el cliente con createClient<Database>(...).
//
// Si faltan las env vars usamos valores placeholder en vez de tirar un error:
// así la app puede montar un mensaje explicativo en pantalla en vez de quedar
// en blanco por una excepción sin capturar durante el import del módulo.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
