import type { Valoracion } from '../../types/domain'

/**
 * Paleta divergente para la escala mal → neutro → bien.
 *
 * La escala es ordinal (una valoración de sentimiento), así que le corresponde
 * una divergente: dos polos con un gris neutro en el medio, nunca un tono.
 *
 * Los valores salieron de validar candidatos con el script de la guía de
 * visualización, contra las superficies reales de las tarjetas (#ffffff en
 * claro, #0f172a en oscuro). El ámbar que usa el resto de la app quedó
 * descartado acá: contra el rojo daba ΔE 14.4 en visión normal, por debajo del
 * piso de 15, o sea que costaba distinguirlos incluso sin daltonismo. Este
 * juego pasa las dos bandas de luminosidad, la separación bajo protanopia y
 * deuteranopia, el piso de visión normal y el contraste, en ambos modos.
 */
export const COLOR_VALORACION: Record<Valoracion, string> = {
  mal: '#dc2626',
  neutro: '#6b7280',
  bien: '#16a34a',
}

export const ORDEN_DIVERGENTE: Valoracion[] = ['mal', 'neutro', 'bien']

export const ETIQUETA_VALORACION: Record<Valoracion, string> = {
  mal: 'Mal',
  neutro: 'Neutro',
  bien: 'Bien',
}
