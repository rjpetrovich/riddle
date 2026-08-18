// Tipos generados a mano a partir de supabase/migrations/*.sql.
// Si tenés el Supabase CLI conectado a tu proyecto, podés regenerarlos con:
//   supabase gen types typescript --project-id <tu-project-id> > src/types/database.types.ts

export type TipoComida = 'desayuno' | 'almuerzo' | 'cena' | 'snack' | 'otro'
export type Valoracion = 'bien' | 'neutro' | 'mal'
export type TipoSintoma = 'sintoma' | 'positivo'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; nombre: string | null; created_at: string }
        Insert: { id: string; nombre?: string | null }
        Update: { nombre?: string | null }
      }
      alimentos_catalogo: {
        Row: { id: string; usuario_id: string; nombre: string; created_at: string }
        Insert: { id?: string; usuario_id: string; nombre: string }
        Update: { nombre?: string }
      }
      comidas: {
        Row: {
          id: string
          usuario_id: string
          fecha_hora: string
          tipo_comida: TipoComida
          nombre: string
          foto_url: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          fecha_hora: string
          tipo_comida: TipoComida
          nombre: string
          foto_url?: string | null
          notas?: string | null
        }
        Update: {
          fecha_hora?: string
          tipo_comida?: TipoComida
          nombre?: string
          foto_url?: string | null
          notas?: string | null
        }
      }
      comida_alimentos: {
        Row: { id: string; comida_id: string; alimento_id: string; cantidad: string | null }
        Insert: { id?: string; comida_id: string; alimento_id: string; cantidad?: string | null }
        Update: { cantidad?: string | null }
      }
      sintomas_catalogo: {
        Row: {
          id: string
          usuario_id: string
          nombre: string
          tipo: TipoSintoma
          activo: boolean
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          nombre: string
          tipo?: TipoSintoma
          activo?: boolean
          orden?: number
        }
        Update: { nombre?: string; tipo?: TipoSintoma; activo?: boolean; orden?: number }
      }
      sensaciones: {
        Row: {
          id: string
          usuario_id: string
          comida_id: string | null
          fecha_hora: string
          valoracion: Valoracion
          intensidad: number | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          comida_id?: string | null
          fecha_hora: string
          valoracion: Valoracion
          intensidad?: number | null
          notas?: string | null
        }
        Update: {
          comida_id?: string | null
          fecha_hora?: string
          valoracion?: Valoracion
          intensidad?: number | null
          notas?: string | null
        }
      }
      sensacion_sintomas: {
        Row: { id: string; sensacion_id: string; sintoma_id: string }
        Insert: { id?: string; sensacion_id: string; sintoma_id: string }
        Update: Record<string, never>
      }
    }
  }
}
