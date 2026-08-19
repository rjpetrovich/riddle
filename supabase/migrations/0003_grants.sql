-- Cómo Me Cae — permisos de acceso para la API de Supabase.
--
-- Las políticas de RLS filtran QUÉ FILAS ve cada usuario, pero no otorgan
-- acceso a la tabla en sí: eso son los GRANT de Postgres. Supabase suele
-- aplicarlos vía default privileges, pero si el esquema se creó fuera de ese
-- camino las tablas quedan sin permisos y la API responde
-- "permission denied for table ...".
--
-- Se otorga solo a `authenticated` (la app exige login; `anon` no necesita
-- tocar estos datos de salud) y a `service_role`, que ya ignora RLS.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on
  profiles,
  alimentos_catalogo,
  comidas,
  comida_alimentos,
  sintomas_catalogo,
  sensaciones,
  sensacion_sintomas
to authenticated, service_role;

-- Por si en el futuro se agregan secuencias (los IDs actuales son uuid).
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Que las tablas que se creen más adelante hereden estos permisos.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;

notify pgrst, 'reload schema';
