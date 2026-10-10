-- ==========================================================
-- Migración para el dashboard de ventas y la gestión de pedidos
-- (envío / cancelación). Ejecutar en la base api_usuarios.
-- Es segura de repetir: no borra ni duplica nada.
-- ==========================================================

-- 1. Estados de pedido adicionales: Enviado y Cancelado.
ALTER TABLE public.pedidos
    DROP CONSTRAINT IF EXISTS pedidos_estado_check;

ALTER TABLE public.pedidos
    ADD CONSTRAINT pedidos_estado_check
    CHECK (estado IN ('pendiente_pago', 'pagado', 'enviado', 'cancelado'));

-- 2. Fecha en que se confirmó el envío / se canceló el pedido.
ALTER TABLE public.pedidos
    ADD COLUMN IF NOT EXISTS enviado_en   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelado_en TIMESTAMPTZ;

-- 3. Índices para que los filtros por fecha y las agregaciones
--    (SUM / COUNT / GROUP BY) no recorran toda la tabla.
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha
    ON public.pedidos(fecha);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado_fecha
    ON public.pedidos(estado, fecha);

CREATE INDEX IF NOT EXISTS idx_pedido_items_publicacion
    ON public.pedido_items(publicacion_id);
