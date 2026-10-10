const OrderRepositoryPort = require('../domain/orderRepositoryPort');
const db = require('./db');

class OrderRepositoryAdapter extends OrderRepositoryPort {
    async createPending(customerId, items) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const orderResult = await client.query(
                `INSERT INTO pedidos (cliente_id, estado, total)
                 VALUES ($1, 'pendiente_pago', 0)
                 RETURNING id, cliente_id, estado, total, fecha`,
                [customerId]
            );
            const order = orderResult.rows[0];
            let total = 0;
            const savedItems = [];

            for (const item of items) {
                const result = await client.query(
                    `SELECT id, nombre, precio, vendedor_id
                     FROM publicaciones
                     WHERE id = $1 AND estado = 'aprobada'
                     FOR SHARE`,
                    [item.productId]
                );
                if (!result.rows.length) {
                    const error = new Error(`El producto ${item.productId} no existe o no está disponible`);
                    error.status = 400;
                    throw error;
                }
                const product = result.rows[0];
                const quantity = Number(item.quantity);
                if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                    const error = new Error('Cantidad no válida');
                    error.status = 400;
                    throw error;
                }
                const unitPrice = Number(product.precio);
                if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
                    const error = new Error(`El producto "${product.nombre}" aún no tiene un precio válido`);
                    error.status = 400;
                    throw error;
                }
                const subtotal = Math.round(unitPrice * quantity * 100) / 100;
                total += subtotal;
                const line = await client.query(
                    `INSERT INTO pedido_items (pedido_id, publicacion_id, nombre_producto, cantidad, precio_unitario, subtotal)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING id, publicacion_id, nombre_producto, cantidad, precio_unitario, subtotal`,
                    [order.id, product.id, product.nombre, quantity, unitPrice, subtotal]
                );
                savedItems.push(line.rows[0]);
            }
            total = Math.round(total * 100) / 100;
            const updated = await client.query(
                `UPDATE pedidos SET total = $1 WHERE id = $2
                 RETURNING id, cliente_id, estado, total, fecha`,
                [total, order.id]
            );
            await client.query('COMMIT');
            return this.findByIdForCustomer(updated.rows[0].id, customerId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findByIdForCustomer(orderId, customerId) {
        const orderResult = await db.query(
            `SELECT p.id, p.cliente_id, p.estado, p.total, p.fecha, u.nombre AS cliente, u.email AS cliente_email
             FROM pedidos p JOIN usuarios u ON u.id = p.cliente_id
             WHERE p.id = $1 AND p.cliente_id = $2`,
            [orderId, customerId]
        );
        if (!orderResult.rows.length) return null;
        const order = orderResult.rows[0];
        const items = await db.query(
            `SELECT publicacion_id, nombre_producto, cantidad, precio_unitario, subtotal
             FROM pedido_items WHERE pedido_id = $1 ORDER BY id`,
            [order.id]
        );
        return { ...order, items: items.rows };
    }

    async listByCustomer(customerId) {
        const result = await db.query(
            `SELECT id, estado, total, fecha, pagado_en
             FROM pedidos WHERE cliente_id = $1 ORDER BY fecha DESC`,
            [customerId]
        );
        return result.rows;
    }

    async markPaid(orderId, customerId) {
        const result = await db.query(
            `UPDATE pedidos SET estado = 'pagado', pagado_en = CURRENT_TIMESTAMP
             WHERE id = $1 AND cliente_id = $2 AND estado = 'pendiente_pago'
             RETURNING id`,
            [orderId, customerId]
        );
        if (!result.rows.length) return null;
        return this.findByIdForCustomer(orderId, customerId);
    }

    // Pedido por id, sin restringir por cliente (uso interno / administración).
    async findById(orderId) {
        const result = await db.query(
            `SELECT p.id, p.cliente_id, p.estado, p.total, p.fecha, p.pagado_en,
                    p.enviado_en, p.cancelado_en,
                    u.nombre AS cliente, u.email AS cliente_email
             FROM pedidos p LEFT JOIN usuarios u ON u.id = p.cliente_id
             WHERE p.id = $1`,
            [orderId]
        );
        return result.rows[0] || null;
    }

    // Listado para el administrador. LEFT JOIN porque cliente_id puede ser
    // NULL si el usuario fue eliminado (los pedidos se conservan).
    async listAll({ estado = null, limite = 200 } = {}) {
        const result = await db.query(
            `SELECT p.id, p.cliente_id, p.estado, p.total, p.fecha, p.pagado_en,
                    p.enviado_en, p.cancelado_en,
                    u.nombre AS cliente, u.email AS cliente_email,
                    COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'nombre', pi.nombre_producto,
                                'cantidad', pi.cantidad,
                                'subtotal', pi.subtotal
                            ) ORDER BY pi.id
                        )
                        FROM pedido_items pi WHERE pi.pedido_id = p.id
                    ), '[]'::json) AS items
             FROM pedidos p
             LEFT JOIN usuarios u ON u.id = p.cliente_id
             WHERE ($1::text IS NULL OR p.estado = $1::text)
             ORDER BY p.fecha DESC, p.id DESC
             LIMIT $2`,
            [estado, limite]
        );
        return result.rows;
    }

    /**
     * Cambia el estado de un pedido SOLO si hoy está en uno de los
     * estados permitidos (from). Es una sola sentencia atómica: si dos
     * personas actúan a la vez (p. ej. el cliente cancela mientras el
     * admin confirma el envío) solo una de las dos puede ganar.
     *
     * customerId (opcional): exige además que el pedido sea de ese cliente.
     * Devuelve true si se cambió, false si no cumplía las condiciones.
     */
    async transition(orderId, { from, to, customerId = null }) {
        const result = await db.query(
            `UPDATE pedidos
             SET estado = $2::text,
                 enviado_en = CASE WHEN $2::text = 'enviado'
                                   THEN CURRENT_TIMESTAMP ELSE enviado_en END,
                 cancelado_en = CASE WHEN $2::text = 'cancelado'
                                     THEN CURRENT_TIMESTAMP ELSE cancelado_en END
             WHERE id = $1
               AND estado = ANY($3::text[])
               AND ($4::int IS NULL OR cliente_id = $4::int)
             RETURNING id`,
            [orderId, to, from, customerId]
        );
        return result.rows.length > 0;
    }
}
module.exports = OrderRepositoryAdapter;
