-- Migración aditiva para precios, pedidos y notificaciones de E-Tienda.
-- Ejecutar en la base api_usuarios después de desplegar la versión actualizada.

ALTER TABLE public.publicaciones
    ADD COLUMN IF NOT EXISTS precio NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.pedidos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    estado VARCHAR(24) NOT NULL DEFAULT 'pendiente_pago'
        CHECK (estado IN ('pendiente_pago', 'pagado')),
    total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pagado_en TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.pedido_items (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    publicacion_id INTEGER REFERENCES public.publicaciones(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_fecha
    ON public.pedidos(cliente_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido
    ON public.pedido_items(pedido_id);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tienda_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tienda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tienda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tienda_user;
