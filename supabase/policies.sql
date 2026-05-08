-- ============================================================
-- CREAR Dance Academy — Row Level Security Policies
-- Apply AFTER schema.sql in Supabase SQL Editor
-- ============================================================
-- Strategy: all tables are accessible exclusively to
-- authenticated users (academy staff). No public access.
-- ============================================================

-- ── Helper: enable RLS on every table ────────────────────
alter table profesores           enable row level security;
alter table grupos               enable row level security;
alter table alumnos              enable row level security;
alter table inscripciones        enable row level security;
alter table asistencias          enable row level security;
alter table cuotas               enable row level security;
alter table pagos                enable row level security;
alter table comprobantes         enable row level security;
alter table padres               enable row level security;
alter table alumnos_padres       enable row level security;
alter table criterios            enable row level security;
alter table plantillas_evaluacion enable row level security;
alter table plantilla_criterios  enable row level security;
alter table evaluaciones         enable row level security;
alter table evaluacion_detalle   enable row level security;
alter table sueldos              enable row level security;

-- ── Macro: authenticated users have full access ───────────
-- profesores
create policy "auth_all_profesores" on profesores
  for all to authenticated using (true) with check (true);

-- grupos
create policy "auth_all_grupos" on grupos
  for all to authenticated using (true) with check (true);

-- alumnos
create policy "auth_all_alumnos" on alumnos
  for all to authenticated using (true) with check (true);

-- inscripciones
create policy "auth_all_inscripciones" on inscripciones
  for all to authenticated using (true) with check (true);

-- asistencias
create policy "auth_all_asistencias" on asistencias
  for all to authenticated using (true) with check (true);

-- cuotas
create policy "auth_all_cuotas" on cuotas
  for all to authenticated using (true) with check (true);

-- pagos
create policy "auth_all_pagos" on pagos
  for all to authenticated using (true) with check (true);

-- comprobantes
create policy "auth_all_comprobantes" on comprobantes
  for all to authenticated using (true) with check (true);

-- padres
create policy "auth_all_padres" on padres
  for all to authenticated using (true) with check (true);

-- alumnos_padres
create policy "auth_all_alumnos_padres" on alumnos_padres
  for all to authenticated using (true) with check (true);

-- criterios
create policy "auth_all_criterios" on criterios
  for all to authenticated using (true) with check (true);

-- plantillas_evaluacion
create policy "auth_all_plantillas_evaluacion" on plantillas_evaluacion
  for all to authenticated using (true) with check (true);

-- plantilla_criterios
create policy "auth_all_plantilla_criterios" on plantilla_criterios
  for all to authenticated using (true) with check (true);

-- evaluaciones
create policy "auth_all_evaluaciones" on evaluaciones
  for all to authenticated using (true) with check (true);

-- evaluacion_detalle
create policy "auth_all_evaluacion_detalle" on evaluacion_detalle
  for all to authenticated using (true) with check (true);

-- sueldos
create policy "auth_all_sueldos" on sueldos
  for all to authenticated using (true) with check (true);
