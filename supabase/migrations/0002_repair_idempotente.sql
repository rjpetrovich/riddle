-- Cómo Me Cae — script de reparación idempotente.
--
-- Aplica el esquema completo de 0001_init.sql, pero escrito para poder
-- ejecutarse cuantas veces haga falta y en cualquier estado de la base:
-- si algo ya existe lo deja como está, si falta lo crea. Sirve para
-- recuperarse de una migración inicial que falló a mitad de camino.

create extension if not exists pgcrypto;

-- ============================================================================
-- Tipos (create type no admite "if not exists")
-- ============================================================================
do $$ begin
  create type tipo_comida as enum ('desayuno', 'almuerzo', 'cena', 'snack', 'otro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type valoracion_tipo as enum ('bien', 'neutro', 'mal');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tipo_sintoma as enum ('sintoma', 'positivo');
exception when duplicate_object then null;
end $$;

-- ============================================================================
-- Tablas
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now()
);

create table if not exists alimentos_catalogo (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now(),
  unique (usuario_id, nombre)
);
create index if not exists alimentos_catalogo_usuario_idx on alimentos_catalogo (usuario_id);

create table if not exists comidas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  fecha_hora timestamptz not null default now(),
  tipo_comida tipo_comida not null,
  nombre text not null,
  foto_url text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comidas_usuario_fecha_idx on comidas (usuario_id, fecha_hora desc);

create table if not exists comida_alimentos (
  id uuid primary key default gen_random_uuid(),
  comida_id uuid not null references comidas(id) on delete cascade,
  alimento_id uuid not null references alimentos_catalogo(id) on delete cascade,
  cantidad text,
  unique (comida_id, alimento_id)
);
create index if not exists comida_alimentos_alimento_idx on comida_alimentos (alimento_id);

create table if not exists sintomas_catalogo (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo tipo_sintoma not null default 'sintoma',
  activo boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  unique (usuario_id, nombre)
);
create index if not exists sintomas_catalogo_usuario_idx on sintomas_catalogo (usuario_id);

create table if not exists sensaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  comida_id uuid references comidas(id) on delete set null,
  fecha_hora timestamptz not null default now(),
  valoracion valoracion_tipo not null,
  intensidad smallint check (intensidad between 1 and 5),
  notas text,
  created_at timestamptz not null default now()
);
create index if not exists sensaciones_usuario_fecha_idx on sensaciones (usuario_id, fecha_hora desc);
create index if not exists sensaciones_comida_idx on sensaciones (comida_id);

create table if not exists sensacion_sintomas (
  id uuid primary key default gen_random_uuid(),
  sensacion_id uuid not null references sensaciones(id) on delete cascade,
  sintoma_id uuid not null references sintomas_catalogo(id) on delete cascade,
  unique (sensacion_id, sintoma_id)
);
create index if not exists sensacion_sintomas_sintoma_idx on sensacion_sintomas (sintoma_id);

-- ============================================================================
-- Funciones y triggers
-- ============================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists comidas_set_updated_at on comidas;
create trigger comidas_set_updated_at
  before update on comidas
  for each row execute function set_updated_at();

create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  insert into public.sintomas_catalogo (usuario_id, nombre, tipo, orden)
  values
    (new.id, 'Hinchazón', 'sintoma', 0),
    (new.id, 'Dolor de estómago', 'sintoma', 1),
    (new.id, 'Acidez', 'sintoma', 2),
    (new.id, 'Gases', 'sintoma', 3),
    (new.id, 'Energía baja', 'sintoma', 4),
    (new.id, 'Dolor de cabeza', 'sintoma', 5),
    (new.id, 'Mal sueño', 'sintoma', 6),
    (new.id, 'Mal ánimo', 'sintoma', 7),
    (new.id, 'Energía alta', 'positivo', 8),
    (new.id, 'Buen sueño', 'positivo', 9),
    (new.id, 'Buen ánimo', 'positivo', 10)
  on conflict (usuario_id, nombre) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill: usuarios que ya se registraron antes de que existiera el trigger
-- se quedaron sin perfil ni síntomas por defecto.
insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;

-- Solo para usuarios que no tienen ningún síntoma todavía. Sin este filtro,
-- volver a correr el script le reinstalaría a quien ya borró síntomas desde
-- Ajustes los que había eliminado: "on conflict do nothing" no distingue entre
-- "nunca existió" y "el usuario lo borró a propósito".
insert into public.sintomas_catalogo (usuario_id, nombre, tipo, orden)
select u.id, s.nombre, s.tipo::tipo_sintoma, s.orden
from auth.users u
cross join (values
  ('Hinchazón', 'sintoma', 0),
  ('Dolor de estómago', 'sintoma', 1),
  ('Acidez', 'sintoma', 2),
  ('Gases', 'sintoma', 3),
  ('Energía baja', 'sintoma', 4),
  ('Dolor de cabeza', 'sintoma', 5),
  ('Mal sueño', 'sintoma', 6),
  ('Mal ánimo', 'sintoma', 7),
  ('Energía alta', 'positivo', 8),
  ('Buen sueño', 'positivo', 9),
  ('Buen ánimo', 'positivo', 10)
) as s(nombre, tipo, orden)
where not exists (
  select 1 from public.sintomas_catalogo sc where sc.usuario_id = u.id
)
on conflict (usuario_id, nombre) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table alimentos_catalogo enable row level security;
alter table comidas enable row level security;
alter table comida_alimentos enable row level security;
alter table sintomas_catalogo enable row level security;
alter table sensaciones enable row level security;
alter table sensacion_sintomas enable row level security;

drop policy if exists "ver y editar el propio perfil" on profiles;
create policy "ver y editar el propio perfil"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "usuarios gestionan sus propios alimentos" on alimentos_catalogo;
create policy "usuarios gestionan sus propios alimentos"
  on alimentos_catalogo for all
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "usuarios gestionan sus propias comidas" on comidas;
create policy "usuarios gestionan sus propias comidas"
  on comidas for all
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "usuarios gestionan sus propios sintomas" on sintomas_catalogo;
create policy "usuarios gestionan sus propios sintomas"
  on sintomas_catalogo for all
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "usuarios gestionan sus propias sensaciones" on sensaciones;
create policy "usuarios gestionan sus propias sensaciones"
  on sensaciones for all
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "comida_alimentos sigue el dueño de la comida" on comida_alimentos;
create policy "comida_alimentos sigue el dueño de la comida"
  on comida_alimentos for all
  using (exists (
    select 1 from comidas c where c.id = comida_id and c.usuario_id = auth.uid()
  ))
  with check (exists (
    select 1 from comidas c where c.id = comida_id and c.usuario_id = auth.uid()
  ));

drop policy if exists "sensacion_sintomas sigue el dueño de la sensacion" on sensacion_sintomas;
create policy "sensacion_sintomas sigue el dueño de la sensacion"
  on sensacion_sintomas for all
  using (exists (
    select 1 from sensaciones s where s.id = sensacion_id and s.usuario_id = auth.uid()
  ))
  with check (exists (
    select 1 from sensaciones s where s.id = sensacion_id and s.usuario_id = auth.uid()
  ));

-- ============================================================================
-- Storage: fotos de comidas
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('comida-fotos', 'comida-fotos', true)
on conflict (id) do nothing;

drop policy if exists "usuarios suben fotos a su propia carpeta" on storage.objects;
create policy "usuarios suben fotos a su propia carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'comida-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "usuarios actualizan sus propias fotos" on storage.objects;
create policy "usuarios actualizan sus propias fotos"
  on storage.objects for update
  using (
    bucket_id = 'comida-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "usuarios borran sus propias fotos" on storage.objects;
create policy "usuarios borran sus propias fotos"
  on storage.objects for delete
  using (
    bucket_id = 'comida-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos de comida son de lectura publica" on storage.objects;
create policy "fotos de comida son de lectura publica"
  on storage.objects for select
  using (bucket_id = 'comida-fotos');

-- ============================================================================
-- Refrescar la caché de esquema de PostgREST (la API de Supabase)
-- ============================================================================
notify pgrst, 'reload schema';
