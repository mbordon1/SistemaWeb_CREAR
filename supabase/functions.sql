-- ============================================================
-- CREAR Dance Academy — PostgreSQL Functions / RPCs
-- Apply AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ── registrar_pago ────────────────────────────────────────
-- Atomic payment registration: inserts pago + updates cuota
-- state + creates comprobante in a single transaction.
-- Called via supabase.rpc('registrar_pago', {...})
-- ─────────────────────────────────────────────────────────
create or replace function registrar_pago(
  p_cuota_id   bigint,
  p_monto      numeric,
  p_metodo     text,
  p_fecha_pago date
)
returns json
language plpgsql
security definer
as $$
declare
  v_pago_id      bigint;
  v_comp_id      bigint;
  v_numero       integer;
begin
  -- 1. Insert pago
  insert into pagos (cuota_id, monto_pagado, metodo, fecha_pago)
  values (p_cuota_id, p_monto, p_metodo, p_fecha_pago)
  returning id into v_pago_id;

  -- 2. Mark cuota as paid
  update cuotas
  set estado = 'pagada'
  where id = p_cuota_id;

  -- 3. Next receipt number (thread-safe via advisory lock not needed:
  --    the unique constraint on comprobantes.numero handles races)
  select coalesce(max(numero), 0) + 1
  into v_numero
  from comprobantes;

  -- 4. Insert comprobante
  insert into comprobantes (pago_id, numero, fecha)
  values (v_pago_id, v_numero, p_fecha_pago)
  returning id into v_comp_id;

  return json_build_object(
    'pago_id', v_pago_id,
    'comp_id', v_comp_id,
    'numero',  v_numero
  );
end;
$$;

-- Grant execution to authenticated users
grant execute on function registrar_pago(bigint, numeric, text, date) to authenticated;
