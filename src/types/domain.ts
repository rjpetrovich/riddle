import type { TipoComida, TipoSintoma, Valoracion } from './database.types'

export type { TipoComida, TipoSintoma, Valoracion }

export interface Alimento {
  id: string
  nombre: string
}

export interface Comida {
  id: string
  fechaHora: string
  tipoComida: TipoComida
  nombre: string
  fotoUrl: string | null
  notas: string | null
  alimentos: Alimento[]
}

export interface Sintoma {
  id: string
  nombre: string
  tipo: TipoSintoma
  activo: boolean
  orden: number
}

export interface Sensacion {
  id: string
  comidaId: string | null
  fechaHora: string
  valoracion: Valoracion
  intensidad: number | null
  notas: string | null
  sintomaIds: string[]
}

export const TIPOS_COMIDA: { value: TipoComida; label: string }[] = [
  { value: 'desayuno', label: 'Desayuno' },
  { value: 'almuerzo', label: 'Almuerzo' },
  { value: 'cena', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
  { value: 'otro', label: 'Otro' },
]

export const VALORACIONES: { value: Valoracion; label: string }[] = [
  { value: 'bien', label: 'Bien' },
  { value: 'neutro', label: 'Neutro' },
  { value: 'mal', label: 'Mal' },
]

export const SINTOMAS_DEFAULT: { nombre: string; tipo: TipoSintoma }[] = [
  { nombre: 'Hinchazón', tipo: 'sintoma' },
  { nombre: 'Dolor de estómago', tipo: 'sintoma' },
  { nombre: 'Acidez', tipo: 'sintoma' },
  { nombre: 'Gases', tipo: 'sintoma' },
  { nombre: 'Energía baja', tipo: 'sintoma' },
  { nombre: 'Dolor de cabeza', tipo: 'sintoma' },
  { nombre: 'Mal sueño', tipo: 'sintoma' },
  { nombre: 'Mal ánimo', tipo: 'sintoma' },
  { nombre: 'Energía alta', tipo: 'positivo' },
  { nombre: 'Buen sueño', tipo: 'positivo' },
  { nombre: 'Buen ánimo', tipo: 'positivo' },
]
