# Cómo Me Cae

App para registrar lo que comés y cómo te hace sentir, con el objetivo de detectar qué alimentos te sientan bien o mal a lo largo del tiempo.

PWA instalable (funciona bien desde el celular, "agregar a inicio"), con modo oscuro y pensada para registrar algo en menos de 15 segundos.

**App en producción**: https://riddle-sand-nu.vercel.app

## Stack

- **Frontend**: React + TypeScript + Vite, Tailwind CSS v4.
- **Backend**: Supabase (Postgres + Auth + Storage), con row-level security.
- **Datos**: React Query sobre el cliente de Supabase.
- **PWA**: `vite-plugin-pwa` (manifest + service worker con auto-actualización).

## Setup

### 1. Crear el proyecto en Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutá el contenido de [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql). Esto crea las tablas, las políticas de RLS, el trigger que precarga los síntomas por defecto para cada usuario nuevo, y el bucket de Storage `comida-fotos`.
3. En **Authentication → Providers**, dejá habilitado el login por **Email** (magic link / OTP). No hace falta configurar contraseña.
4. En **Authentication → URL Configuration**, agregá la URL donde vas a correr/deployar la app (por ejemplo `http://localhost:5173` en desarrollo, y la URL de Vercel en producción) a la lista de **Redirect URLs**.
5. Copiá la **Project URL** y la **anon public key** desde **Settings → API**.

### 2. Variables de entorno

```bash
cp .env.example .env
```

Completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto.

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Build / preview

```bash
npm run build
npm run preview
```

### 5. Deploy

Pensado para [Vercel](https://vercel.com): importá el repo, framework preset "Vite", y configurá las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en el proyecto de Vercel. No hace falta configuración adicional — es un build estático.

## Arquitectura

```
src/
  app/            Providers (React Query + Auth), router y layout (bottom nav + FAB)
  components/ui/  Design system propio (Button, Input, Chip, Card, etc.)
  features/
    auth/         Login por magic link, AuthProvider/useAuth
    meals/        Alta/edición de comidas, autocompletado de ingredientes
    feelings/     Alta/edición de sensaciones, síntomas asociados
    timeline/     Vista Hoy: timeline del día con filtros
    foods/        Vista "Alimentos" y detalle por alimento
    stats/        Algoritmo de detección de patrones + vista de estadísticas
    settings/     Ajustes: tema, editor de síntomas, export CSV
  lib/            Cliente de Supabase, query keys, utilidades de fecha
  types/          Tipos de la base (database.types.ts) y de dominio (domain.ts)
supabase/
  migrations/     SQL versionado del esquema
```

### Modelo de datos

- `comidas` — un registro de comida (nombre, hora, tipo, foto, notas).
- `alimentos_catalogo` — catálogo personal de alimentos, reutilizado para autocompletado y estadísticas.
- `comida_alimentos` — relación N a N entre comidas e ingredientes.
- `sensaciones` — cómo te sentiste, opcionalmente asociado a una `comida_id`.
- `sintomas_catalogo` — lista de síntomas/sensaciones editable por el usuario (se precarga un set por defecto al registrarse).
- `sensacion_sintomas` — síntomas seleccionados en cada sensación.

Todas las tablas tienen RLS: cada usuario solo puede leer/escribir sus propias filas (`auth.uid() = usuario_id`, o a través del dueño de la fila padre en las tablas de relación).

### Detección de patrones

Vive en `src/features/stats/patternDetection.ts` (funciones puras, sin dependencias de Supabase):

- Para cada comida con una o más sensaciones asociadas, se toma la **peor** valoración reportada (mal > neutro > bien).
- Para cada alimento, se agregan todas las comidas en las que apareció y se calcula el % de veces que esa comida terminó en "bien" / "neutro" / "mal".
- Un alimento se marca como **posible sospechoso** con ≥3 registros con sensación asociada y >60% de "mal".
- Un alimento se marca como **seguro** con ≥3 registros y 100% de "bien".

El cálculo se hace en el cliente (no en SQL) porque el volumen de datos de un diario personal es chico; si en el futuro se necesita optimizar, se puede mover a una vista o función de Postgres sin cambiar el modelo de datos.

## Pendiente / fuera de alcance de esta primera versión

- Notificaciones push reales para recordar registrar una sensación (requiere infraestructura de push + VAPID keys). Por ahora no está implementado.
- Exportación a PDF (se implementó CSV, que cubre el mismo caso de uso de llevar el historial a una consulta).
