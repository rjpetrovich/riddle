export const queryKeys = {
  comidas: (usuarioId: string) => ['comidas', usuarioId] as const,
  comidasRango: (usuarioId: string, desde: string, hasta: string) =>
    ['comidas', usuarioId, desde, hasta] as const,
  sensaciones: (usuarioId: string) => ['sensaciones', usuarioId] as const,
  sensacionesRango: (usuarioId: string, desde: string, hasta: string) =>
    ['sensaciones', usuarioId, desde, hasta] as const,
  alimentos: (usuarioId: string) => ['alimentos', usuarioId] as const,
  alimentoDetalle: (usuarioId: string, alimentoId: string) =>
    ['alimentos', usuarioId, alimentoId] as const,
  sintomas: (usuarioId: string) => ['sintomas', usuarioId] as const,
}
