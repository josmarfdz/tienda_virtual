-- ==========================================================
-- DATOS DE DEMOSTRACIÓN para probar el dashboard.
-- Requisitos: haber ejecutado migration_pedidos.sql y
-- migration_analytics.sql, y que exista al menos un vendedor.
-- Genera ~150 pedidos repartidos en los últimos 60 días.
-- Es seguro repetirlo: si ya hay pedidos demo, no hace nada.
-- Contraseña de los clientes demo: 123456
-- ==========================================================

DO $$
DECLARE
    v_hash       TEXT := '$2b$10$7jbxRogn1OAVWFG1Ab6fE.3QSYNYHD9vGys2e3GN5//Iy6kgh0voa';
    v_vendedor   INTEGER;
    v_clientes   INTEGER[];
    v_cliente    INTEGER;
    v_pedido     BIGINT;
    v_estado     TEXT;
    v_fecha      TIMESTAMPTZ;
    v_total      NUMERIC(12,2);
    v_cantidad   INTEGER;
    v_r          DOUBLE PRECISION;
    prod         RECORD;
    i            INTEGER;
BEGIN
    SELECT id INTO v_vendedor
    FROM usuarios WHERE rol = 'vendedor' ORDER BY id LIMIT 1;

    IF v_vendedor IS NULL THEN
        RAISE EXCEPTION 'Necesitas al menos un usuario con rol vendedor.';
    END IF;

    -- Clientes demo
    INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
        ('Demo Ana',    'demo1@cliente.com', v_hash, 'cliente'),
        ('Demo Luis',   'demo2@cliente.com', v_hash, 'cliente'),
        ('Demo Marta',  'demo3@cliente.com', v_hash, 'cliente'),
        ('Demo Pedro',  'demo4@cliente.com', v_hash, 'cliente'),
        ('Demo Sofía',  'demo5@cliente.com', v_hash, 'cliente')
    ON CONFLICT (email) DO NOTHING;

    SELECT array_agg(id) INTO v_clientes
    FROM usuarios WHERE email LIKE 'demo_@cliente.com';

    IF EXISTS (SELECT 1 FROM pedidos WHERE cliente_id = ANY(v_clientes)) THEN
        RAISE NOTICE 'Los datos demo ya estaban cargados. No se hizo nada.';
        RETURN;
    END IF;

    -- Productos demo (aprobados y con precio)
    INSERT INTO publicaciones (vendedor_id, nombre, descripcion, imagen, estado, precio)
    SELECT v_vendedor, d.nombre, d.descripcion, NULL, 'aprobada', d.precio
    FROM (VALUES
        ('Teclado mecánico',     'Teclado mecánico RGB switches rojos',  899.00),
        ('Mouse inalámbrico',    'Mouse ergonómico recargable',          349.50),
        ('Monitor 24 pulgadas',  'Monitor Full HD 75 Hz',               2799.00),
        ('Webcam HD',            'Webcam 1080p con micrófono',           599.00),
        ('Mochila para laptop',  'Mochila impermeable de 15.6"',         529.90),
        ('Hub USB-C',            'Hub 6 en 1 con HDMI',                  749.00)
    ) AS d(nombre, descripcion, precio)
    WHERE NOT EXISTS (SELECT 1 FROM publicaciones p WHERE p.nombre = d.nombre);

    -- Si la publicación original no tiene precio, le ponemos uno
    UPDATE publicaciones SET precio = 1299.00
    WHERE precio = 0 AND estado = 'aprobada';

    -- Pedidos
    FOR i IN 1..150 LOOP
        v_cliente := v_clientes[1 + floor(random() * array_length(v_clientes, 1))::int];
        v_fecha   := now() - random() * interval '60 days';
        v_r       := random();

        v_estado := CASE
            WHEN v_r < 0.15 THEN 'pendiente_pago'
            WHEN v_r < 0.60 THEN 'pagado'
            WHEN v_r < 0.85 THEN 'enviado'
            ELSE 'cancelado'
        END;

        INSERT INTO pedidos (cliente_id, estado, total, fecha, pagado_en, enviado_en, cancelado_en)
        VALUES (
            v_cliente, v_estado, 0, v_fecha,
            CASE WHEN v_estado IN ('pagado', 'enviado')
                 THEN v_fecha + interval '2 hours' END,
            CASE WHEN v_estado = 'enviado'
                 THEN v_fecha + interval '1 day' END,
            CASE WHEN v_estado = 'cancelado'
                 THEN v_fecha + interval '3 hours' END
        )
        RETURNING id INTO v_pedido;

        v_total := 0;

        -- 1 a 3 productos distintos por pedido (algunos salen más que otros)
        FOR prod IN
            SELECT id, nombre, precio
            FROM publicaciones
            WHERE estado = 'aprobada' AND precio > 0
            ORDER BY power(random(), 1 + (id % 3))
            LIMIT 1 + floor(random() * 3)::int
        LOOP
            v_cantidad := 1 + floor(random() * 3)::int;

            INSERT INTO pedido_items
                (pedido_id, publicacion_id, nombre_producto, cantidad, precio_unitario, subtotal)
            VALUES
                (v_pedido, prod.id, prod.nombre, v_cantidad, prod.precio, prod.precio * v_cantidad);

            v_total := v_total + prod.precio * v_cantidad;
        END LOOP;

        UPDATE pedidos SET total = v_total WHERE id = v_pedido;
    END LOOP;

    RAISE NOTICE 'Datos demo cargados correctamente.';
END $$;
