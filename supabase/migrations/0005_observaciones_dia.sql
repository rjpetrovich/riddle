-- Observaciones libres del día.
--
-- Van en contadores_dia y no en una tabla nueva: esa tabla ya es "una fila por
-- usuario y día", que es exactamente lo que hace falta. El nombre le queda
-- corto (hoy guarda el registro del día, no solo contadores), pero renombrarla
-- obligaría a otra migración a mano sin ningún beneficio para quien la usa.

alter table contadores_dia add column if not exists observaciones text;

notify pgrst, 'reload schema';
