const SellerRequestRepositoryPort =
    require('../domain/sellerRequestRepositoryPort');

const db = require('./db');

class SellerRequestRepositoryAdapter
    extends SellerRequestRepositoryPort {

    async create(sellerRequest) {
        const result = await db.query(
            `
            INSERT INTO solicitudes_vendedor
                (usuario_id, estado)
            VALUES ($1, $2)

            RETURNING
                id,
                usuario_id,
                estado,
                fecha
            `,
            [
                sellerRequest.usuarioId,
                sellerRequest.estado
            ]
        );

        return result.rows[0];
    }

    async findAll() {
        const result = await db.query(
            `
            SELECT
                s.id,
                s.usuario_id,
                u.nombre,
                u.email,
                u.rol,
                s.estado,
                s.fecha
            FROM solicitudes_vendedor s
            INNER JOIN usuarios u
                ON s.usuario_id = u.id
            ORDER BY s.fecha DESC
            `
        );

        return result.rows;
    }

    async findPendingByUserId(usuarioId) {
        const result = await db.query(
            `
            SELECT
                id,
                usuario_id,
                estado,
                fecha
            FROM solicitudes_vendedor
            WHERE usuario_id = $1
              AND estado = 'pendiente'
            LIMIT 1
            `,
            [usuarioId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async findById(id) {
        const result = await db.query(
            `
            SELECT
                id,
                usuario_id,
                estado,
                fecha
            FROM solicitudes_vendedor
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async approve(id) {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const requestResult =
                await client.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        estado
                    FROM solicitudes_vendedor
                    WHERE id = $1
                    FOR UPDATE
                    `,
                    [id]
                );

            if (requestResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            const request =
                requestResult.rows[0];

            if (request.estado !== 'pendiente') {
                await client.query('ROLLBACK');

                return {
                    alreadyProcessed: true,
                    request
                };
            }

            const updatedRequest =
                await client.query(
                    `
                    UPDATE solicitudes_vendedor
                    SET estado = 'aprobada'
                    WHERE id = $1
                    RETURNING
                        id,
                        usuario_id,
                        estado,
                        fecha
                    `,
                    [id]
                );

            await client.query(
                `
                UPDATE usuarios
                SET rol = 'vendedor'
                WHERE id = $1
                `,
                [request.usuario_id]
            );

            await client.query('COMMIT');

            return {
                alreadyProcessed: false,
                request:
                    updatedRequest.rows[0]
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();
        }
    }

    async reject(id) {
        const result = await db.query(
            `
            UPDATE solicitudes_vendedor
            SET estado = 'rechazada'
            WHERE id = $1
              AND estado = 'pendiente'

            RETURNING
                id,
                usuario_id,
                estado,
                fecha
            `,
            [id]
        );

        if (result.rows.length > 0) {
            return {
                alreadyProcessed: false,
                request: result.rows[0]
            };
        }

        const existing =
            await this.findById(id);

        if (!existing) {
            return null;
        }

        return {
            alreadyProcessed: true,
            request: existing
        };
    }
}

module.exports = SellerRequestRepositoryAdapter;