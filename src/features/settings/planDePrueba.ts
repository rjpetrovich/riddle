import type { TipoComida, Valoracion } from '../../types/domain'

/**
 * Dos semanas de comidas ficticias para poder ver la app con datos.
 *
 * No son datos al azar: están armados para que cada caso del detector de
 * patrones quede representado y se pueda comprobar que funciona.
 *
 *  - Leche y Queso superan el 60% de "mal" con más de 3 registros → sospechosos.
 *  - Café aparece muchas veces con leche y también solo, y sale limpio: es el
 *    caso que muestra que el algoritmo separa al culpable del acompañante.
 *  - Pollo, Arroz, Lechuga y Huevo siempre caen bien → seguros.
 *  - Fideos y Salsa de tomate solo aparecen juntos → par inseparable.
 *  - Palta y Banana quedan en 2 registros → "falta 1 para saber".
 *  - Las dos últimas comidas quedan sin sensación → pendientes y barra del día.
 *
 * Los umbrales viven en patternDetection.ts; el test de este archivo corre el
 * algoritmo real sobre el plan para que un cambio de umbral no lo deje mudo.
 */
export interface ComidaPlan {
  diasAtras: number
  hora: string
  tipo: TipoComida
  nombre: string
  ingredientes: string[]
  valoracion: Valoracion | null
  sintomas?: string[]
  intensidad?: number
}

export const PLAN_COMIDAS: ComidaPlan[] = [
  // — hace 13 días —
  { diasAtras: 13, hora: '08:00', tipo: 'desayuno', nombre: 'Café con leche y tostadas', ingredientes: ['Café', 'Leche', 'Pan'], valoracion: 'mal', sintomas: ['Hinchazón'], intensidad: 3 },
  { diasAtras: 13, hora: '13:00', tipo: 'almuerzo', nombre: 'Pollo con arroz', ingredientes: ['Pollo', 'Arroz'], valoracion: 'bien', sintomas: ['Energía alta'] },
  { diasAtras: 13, hora: '20:30', tipo: 'cena', nombre: 'Ensalada de tomate y lechuga', ingredientes: ['Tomate', 'Lechuga'], valoracion: 'bien' },
  // — hace 12 —
  { diasAtras: 12, hora: '08:15', tipo: 'desayuno', nombre: 'Tostadas con palta', ingredientes: ['Pan', 'Palta'], valoracion: 'bien' },
  { diasAtras: 12, hora: '13:30', tipo: 'almuerzo', nombre: 'Fideos con salsa', ingredientes: ['Fideos', 'Salsa de tomate'], valoracion: 'mal', sintomas: ['Dolor de estómago'], intensidad: 4 },
  { diasAtras: 12, hora: '21:00', tipo: 'cena', nombre: 'Tortilla de huevo', ingredientes: ['Huevo'], valoracion: 'bien' },
  // — hace 11 —
  { diasAtras: 11, hora: '08:00', tipo: 'desayuno', nombre: 'Café con leche', ingredientes: ['Café', 'Leche'], valoracion: 'mal', sintomas: ['Hinchazón', 'Gases'], intensidad: 4 },
  { diasAtras: 11, hora: '13:00', tipo: 'almuerzo', nombre: 'Milanesa con puré', ingredientes: ['Pan'], valoracion: 'neutro' },
  { diasAtras: 11, hora: '16:00', tipo: 'snack', nombre: 'Banana', ingredientes: ['Banana'], valoracion: 'bien' },
  // — hace 10 —
  { diasAtras: 10, hora: '08:30', tipo: 'desayuno', nombre: 'Café solo', ingredientes: ['Café'], valoracion: 'bien' },
  { diasAtras: 10, hora: '13:00', tipo: 'almuerzo', nombre: 'Pollo con ensalada', ingredientes: ['Pollo', 'Lechuga', 'Tomate'], valoracion: 'bien' },
  { diasAtras: 10, hora: '20:00', tipo: 'cena', nombre: 'Sándwich de queso', ingredientes: ['Pan', 'Queso'], valoracion: 'mal', sintomas: ['Acidez'], intensidad: 3 },
  // — hace 9 —
  { diasAtras: 9, hora: '08:00', tipo: 'desayuno', nombre: 'Avena con banana', ingredientes: ['Banana'], valoracion: 'bien' },
  { diasAtras: 9, hora: '13:30', tipo: 'almuerzo', nombre: 'Arroz con pollo', ingredientes: ['Arroz', 'Pollo'], valoracion: 'bien' },
  { diasAtras: 9, hora: '21:00', tipo: 'cena', nombre: 'Fideos con salsa', ingredientes: ['Fideos', 'Salsa de tomate'], valoracion: 'mal', sintomas: ['Hinchazón'], intensidad: 3 },
  // — hace 8 —
  { diasAtras: 8, hora: '08:00', tipo: 'desayuno', nombre: 'Café con leche', ingredientes: ['Café', 'Leche'], valoracion: 'mal', sintomas: ['Gases'], intensidad: 3 },
  { diasAtras: 8, hora: '13:00', tipo: 'almuerzo', nombre: 'Ensalada completa', ingredientes: ['Lechuga', 'Tomate', 'Huevo'], valoracion: 'bien', sintomas: ['Energía alta'] },
  { diasAtras: 8, hora: '20:30', tipo: 'cena', nombre: 'Pizza de muzzarella', ingredientes: ['Pan', 'Queso'], valoracion: 'mal', sintomas: ['Acidez'], intensidad: 4 },
  // — hace 7 —
  { diasAtras: 7, hora: '08:15', tipo: 'desayuno', nombre: 'Tostadas con palta', ingredientes: ['Pan', 'Palta'], valoracion: 'bien' },
  { diasAtras: 7, hora: '13:00', tipo: 'almuerzo', nombre: 'Pollo al horno', ingredientes: ['Pollo', 'Arroz'], valoracion: 'bien' },
  { diasAtras: 7, hora: '19:30', tipo: 'cena', nombre: 'Sopa de verduras', ingredientes: ['Tomate'], valoracion: 'neutro' },
  // — hace 6 —
  { diasAtras: 6, hora: '08:00', tipo: 'desayuno', nombre: 'Café con leche', ingredientes: ['Café', 'Leche'], valoracion: 'neutro' },
  { diasAtras: 6, hora: '13:00', tipo: 'almuerzo', nombre: 'Fideos con salsa', ingredientes: ['Fideos', 'Salsa de tomate'], valoracion: 'mal', sintomas: ['Hinchazón'], intensidad: 4 },
  { diasAtras: 6, hora: '21:00', tipo: 'cena', nombre: 'Ensalada de pollo', ingredientes: ['Pollo', 'Lechuga'], valoracion: 'bien' },
  // — hace 5 —
  { diasAtras: 5, hora: '08:30', tipo: 'desayuno', nombre: 'Café solo', ingredientes: ['Café'], valoracion: 'bien' },
  { diasAtras: 5, hora: '13:00', tipo: 'almuerzo', nombre: 'Arroz con huevo', ingredientes: ['Arroz', 'Huevo'], valoracion: 'bien' },
  { diasAtras: 5, hora: '20:00', tipo: 'cena', nombre: 'Sándwich de queso', ingredientes: ['Pan', 'Queso'], valoracion: 'mal', sintomas: ['Acidez', 'Mal sueño'], intensidad: 3 },
  // — hace 4 —
  { diasAtras: 4, hora: '08:00', tipo: 'desayuno', nombre: 'Leche con cereales', ingredientes: ['Leche'], valoracion: 'mal', sintomas: ['Hinchazón', 'Dolor de estómago'], intensidad: 4 },
  { diasAtras: 4, hora: '13:30', tipo: 'almuerzo', nombre: 'Ensalada', ingredientes: ['Lechuga', 'Tomate'], valoracion: 'bien' },
  { diasAtras: 4, hora: '16:00', tipo: 'snack', nombre: 'Manzana', ingredientes: ['Manzana'], valoracion: 'bien' },
  // — hace 3 —
  { diasAtras: 3, hora: '08:00', tipo: 'desayuno', nombre: 'Café con leche', ingredientes: ['Café', 'Leche'], valoracion: 'mal', sintomas: ['Gases'], intensidad: 3 },
  { diasAtras: 3, hora: '13:00', tipo: 'almuerzo', nombre: 'Pollo con arroz', ingredientes: ['Pollo', 'Arroz'], valoracion: 'bien' },
  { diasAtras: 3, hora: '20:30', tipo: 'cena', nombre: 'Tortilla', ingredientes: ['Huevo'], valoracion: 'bien' },
  // — hace 2 —
  { diasAtras: 2, hora: '08:15', tipo: 'desayuno', nombre: 'Tostadas con queso', ingredientes: ['Pan', 'Queso'], valoracion: 'neutro' },
  { diasAtras: 2, hora: '13:00', tipo: 'almuerzo', nombre: 'Fideos con salsa', ingredientes: ['Fideos', 'Salsa de tomate'], valoracion: 'neutro' },
  { diasAtras: 2, hora: '20:00', tipo: 'cena', nombre: 'Leche con galletas', ingredientes: ['Leche'], valoracion: 'mal', sintomas: ['Hinchazón'], intensidad: 3 },
  // — ayer —
  { diasAtras: 1, hora: '08:00', tipo: 'desayuno', nombre: 'Café con leche', ingredientes: ['Café', 'Leche'], valoracion: 'bien' },
  { diasAtras: 1, hora: '13:00', tipo: 'almuerzo', nombre: 'Ensalada de pollo', ingredientes: ['Pollo', 'Lechuga', 'Tomate'], valoracion: 'bien' },
  { diasAtras: 1, hora: '20:30', tipo: 'cena', nombre: 'Arroz con verduras', ingredientes: ['Arroz', 'Tomate'], valoracion: null },
  // — hoy —
  { diasAtras: 0, hora: '08:30', tipo: 'desayuno', nombre: 'Café solo', ingredientes: ['Café'], valoracion: 'bien' },
  { diasAtras: 0, hora: '13:00', tipo: 'almuerzo', nombre: 'Pollo con ensalada', ingredientes: ['Pollo', 'Lechuga'], valoracion: null },
]

/** Vasos de agua y observación libre por día, para que esa parte tampoco quede vacía. */
export const PLAN_DIAS: { diasAtras: number; vasos: number; observacion: string }[] = [
  { diasAtras: 13, vasos: 5, observacion: 'Día tranquilo, dormí bien.' },
  { diasAtras: 12, vasos: 4, observacion: 'Almuerzo pesado, quedé con sueño.' },
  { diasAtras: 11, vasos: 6, observacion: 'Mañana con hinchazón otra vez.' },
  { diasAtras: 10, vasos: 8, observacion: 'Tomé bastante agua hoy.' },
  { diasAtras: 9, vasos: 5, observacion: 'Cené tarde.' },
  { diasAtras: 8, vasos: 3, observacion: 'Día de mucho trabajo, tomé poca agua.' },
  { diasAtras: 7, vasos: 7, observacion: 'Caminé a la tarde, me sentí liviano.' },
  { diasAtras: 6, vasos: 6, observacion: 'Otra vez malestar después de los fideos.' },
  { diasAtras: 5, vasos: 8, observacion: 'Buen día en general.' },
  { diasAtras: 4, vasos: 4, observacion: 'Desayuno me cayó mal, seguí flojo hasta el mediodía.' },
  { diasAtras: 3, vasos: 7, observacion: 'Mejor que ayer.' },
  { diasAtras: 2, vasos: 5, observacion: 'Cena liviana no me alcanzó, me dio hambre de noche.' },
  { diasAtras: 1, vasos: 9, observacion: 'Día completo, tomé mucha agua.' },
  { diasAtras: 0, vasos: 3, observacion: 'Recién arranca el día.' },
]

/** Fecha real a partir de "hace N días a tal hora", en la zona del dispositivo. */
export function fechaDelPlan(hoy: Date, diasAtras: number, hora: string): Date {
  const [h, m] = hora.split(':').map(Number)
  const d = new Date(hoy)
  d.setDate(d.getDate() - diasAtras)
  d.setHours(h, m, 0, 0)
  return d
}
