import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copiá .env.example a .env y completá los valores de tu proyecto Supabase.',
  )
}

// Sin el genérico Database: los tipos de fila vienen de src/types/domain.ts
// en cada capa de acceso a datos (mealsApi, feelingsApi, foodsApi), en vez de
// depender de que el generador de Supabase coincida exactamente con las
// migraciones a mano. Si generás database.types.ts con el CLI de Supabase
// (ver README), podés volver a tipar el cliente con createClient<Database>(...).
export const supabase = createClient(url, anonKey)
