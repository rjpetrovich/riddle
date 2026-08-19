-- Contadores diarios: vasos de agua e idas al baño.
--
-- Una fila por usuario y día, no un registro por evento: lo que se pide es un
-- contador, y sumar de a uno con un toque tiene que ser instantáneo. Si más
-- adelante hiciera falta cruzar la hora exacta con las comidas, habría que
-- pasar a registrar eventos con timestamp.
--
-- Idempotente: se puede correr más de una vez sin romper nada.

create table if not exists contadores_dia (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  vasos_agua smallint not null default 0 check (vasos_agua >= 0),
  idas_bano smallint not null default 0 check (idas_bano >= 0),
  updated_at timestamptz not null default now(),
  unique (usuario_id, fecha)
);

create index if not exists contadores_dia_usuario_fecha_idx
  on contadores_dia (usuario_id, fecha desc);

drop trigger if exists contadores_dia_set_updated_at on contadores_dia;
create trigger contadores_dia_set_updated_at
  before update on contadores_dia
  for each row execute function set_updated_at();

-- Contar idas al baño es opcional: se activa desde Ajustes.
alter table profiles add column if not exists contar_bano boolean not null default false;

alter table contadores_dia enable row level security;

drop policy if exists "usuarios gestionan sus propios contadores" on contadores_dia;
create policy "usuarios gestionan sus propios contadores"
  on contadores_dia for all
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- Las políticas filtran filas, pero el acceso a la tabla lo dan los GRANT.
grant select, insert, update, delete on contadores_dia to authenticated, service_role;

notify pgrst, 'reload schema';
