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
}
module.exports = OrderRepositoryAdapter;
