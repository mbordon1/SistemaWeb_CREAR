-- ============================================================
-- CREAR Dance Academy — Database Schema
-- Apply in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- ── Profesores ────────────────────────────────────────────
create table if not exists profesores (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  apellido   text not null,
  telefono   text,
  email      text,
  created_at timestamptz default now()
);

-- ── Grupos ────────────────────────────────────────────────
create table if not exists grupos (
  id                              bigint generated always as identity primary key,
  nombre                          text not null,
  nivel                           text,
  capacidad_maxima                integer not null default 30,
  profesor_id                     bigint references profesores (id) on delete set null,
  cuota_base_mensual              numeric(10,2),
  porcentaje_aumento_trimestral   numeric(5,2) default 0,
  fecha_precio_base               date,
  created_at                      timestamptz default now()
);

create index if not exists grupos_profesor_id_idx on grupos (profesor_id);

-- ── Alumnos ───────────────────────────────────────────────
create table if not exists alumnos (
  id               bigint generated always as identity primary key,
  nombre           text not null,
  apellido         text not null,
  dni              text unique,
  telefono         text,
  email            text,
  domicilio        text,
  fecha_nacimiento date,
  fecha_alta       date not null default current_date,
  created_at       timestamptz default now()
);

create index if not exists alumnos_apellido_idx on alumnos (apellido);
create index if not exists alumnos_dni_idx      on alumnos (dni);

-- ── Inscripciones ─────────────────────────────────────────
create table if not exists inscripciones (
  id         bigint generated always as identity primary key,
  alumno_id  bigint not null references alumnos  (id) on delete restrict,
  grupo_id   bigint not null references grupos   (id) on delete restrict,
  fecha      date not null default current_date,
  estado     text not null default 'activa' check (estado in ('activa','baja')),
  created_at timestamptz default now()
);

create index if not exists inscripciones_alumno_idx  on inscripciones (alumno_id);
create index if not exists inscripciones_grupo_idx   on inscripciones (grupo_id);
create index if not exists inscripciones_estado_idx  on inscripciones (estado);

-- ── Asistencias ───────────────────────────────────────────
create table if not exists asistencias (
  alumno_id  bigint not null references alumnos (id) on delete cascade,
  grupo_id   bigint not null references grupos  (id) on delete cascade,
  fecha      date not null,
  presente   boolean not null default true,
  created_at timestamptz default now(),
  primary key (alumno_id, grupo_id, fecha)
);

create index if not exists asistencias_grupo_fecha_idx  on asistencias (grupo_id, fecha);
create index if not exists asistencias_alumno_fecha_idx on asistencias (alumno_id, fecha);

-- ── Cuotas ────────────────────────────────────────────────
create table if not exists cuotas (
  id               bigint generated always as identity primary key,
  alumno_id        bigint not null references alumnos (id) on delete restrict,
  mes              text not null,                         -- 'YYYY-MM'
  monto            numeric(10,2) not null,
  estado           text not null default 'pendiente'
                   check (estado in ('pendiente','vencida','pagada')),
  fecha_vencimiento date not null,
  created_at       timestamptz default now(),
  unique (alumno_id, mes)
);

create index if not exists cuotas_alumno_idx  on cuotas (alumno_id);
create index if not exists cuotas_estado_idx  on cuotas (estado);
create index if not exists cuotas_mes_idx     on cuotas (mes);

-- ── Pagos ─────────────────────────────────────────────────
create table if not exists pagos (
  id           bigint generated always as identity primary key,
  cuota_id     bigint not null references cuotas (id) on delete restrict,
  monto_pagado numeric(10,2) not null,
  fecha_pago   date not null default current_date,
  metodo       text not null default 'efectivo',
  created_at   timestamptz default now(),
  unique (cuota_id)   -- una cuota tiene un único pago
);

create index if not exists pagos_cuota_idx on pagos (cuota_id);

-- ── Comprobantes ──────────────────────────────────────────
create table if not exists comprobantes (
  id         bigint generated always as identity primary key,
  pago_id    bigint not null references pagos (id) on delete restrict,
  numero     integer not null unique,
  fecha      date not null default current_date,
  created_at timestamptz default now()
);

create index if not exists comprobantes_pago_idx on comprobantes (pago_id);

-- ── Padres / tutores ──────────────────────────────────────
create table if not exists padres (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  apellido   text not null,
  telefono   text,
  email      text,
  created_at timestamptz default now()
);

create table if not exists alumnos_padres (
  alumno_id bigint not null references alumnos (id) on delete cascade,
  padre_id  bigint not null references padres  (id) on delete cascade,
  primary key (alumno_id, padre_id)
);

-- ── Evaluaciones ──────────────────────────────────────────
create table if not exists criterios (
  id         bigint generated always as identity primary key,
  nombre     text not null unique,
  created_at timestamptz default now()
);

create table if not exists plantillas_evaluacion (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  grupo_id   bigint references grupos (id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists plantilla_criterios (
  plantilla_id bigint not null references plantillas_evaluacion (id) on delete cascade,
  criterio_id  bigint not null references criterios             (id) on delete cascade,
  primary key (plantilla_id, criterio_id)
);

create table if not exists evaluaciones (
  id           bigint generated always as identity primary key,
  alumno_id    bigint not null references alumnos              (id) on delete restrict,
  grupo_id     bigint not null references grupos               (id) on delete restrict,
  plantilla_id bigint references plantillas_evaluacion         (id) on delete set null,
  fecha        date not null default current_date,
  created_at   timestamptz default now()
);

create index if not exists evaluaciones_alumno_idx   on evaluaciones (alumno_id);
create index if not exists evaluaciones_grupo_idx    on evaluaciones (grupo_id);

create table if not exists evaluacion_detalle (
  evaluacion_id bigint not null references evaluaciones (id) on delete cascade,
  criterio_id   bigint not null references criterios    (id) on delete restrict,
  nota          numeric(5,2),
  observacion   text,
  primary key (evaluacion_id, criterio_id)
);

-- ── Sueldos ───────────────────────────────────────────────
create table if not exists sueldos (
  id           bigint generated always as identity primary key,
  profesor_id  bigint not null references profesores (id) on delete restrict,
  periodo      text not null,   -- 'YYYY-MM'
  monto        numeric(10,2) not null,
  estado       text not null default 'pendiente' check (estado in ('pendiente','pagado')),
  fecha_pago   date,
  observacion  text,
  created_at   timestamptz default now(),
  unique (profesor_id, periodo)
);

create index if not exists sueldos_profesor_idx on sueldos (profesor_id);
create index if not exists sueldos_periodo_idx  on sueldos (periodo);
