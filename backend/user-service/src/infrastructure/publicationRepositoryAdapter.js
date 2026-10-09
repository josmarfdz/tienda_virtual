const PublicationRepositoryPort =
    require('../domain/publicationRepositoryPort');

const db = require('./db');

class PublicationRepositoryAdapter
    extends PublicationRepositoryPort {

    async create(publication) {
        const result = await db.query(
            `
            INSERT INTO publicaciones
            (
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado
            )
            VALUES ($1, $2, $3, $4, $5, $6)

            RETURNING
                id,
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado,
                fecha
            `,
            [
                publication.vendedorId,
                publication.nombre,
                publication.descripcion,
                publication.imagen,
                publication.precio,
                publication.estado
            ]
        );

        return result.rows[0];
    }


    // Publicaciones visibles para clientes
    async findApproved() {
        const result = await db.query(
            `
            SELECT
                p.id,
                p.vendedor_id,
                p.nombre,
                p.descripcion,
                p.imagen,
                p.precio,
                p.estado,
                p.fecha,
                u.nombre AS vendedor
            FROM publicaciones p

            INNER JOIN usuarios u
                ON p.vendedor_id = u.id

            WHERE p.estado = 'aprobada'

            ORDER BY p.fecha DESC
            `
        );

        return result.rows;
    }


    // Todas las publicaciones.
    // Esta consulta será para administrador.
    async findAll() {
        const result = await db.query(
            `
            SELECT
                p.id,
                p.vendedor_id,
                p.nombre,
                p.descripcion,
                p.imagen,
                p.precio,
                p.estado,
                p.fecha,
                u.nombre AS vendedor,
                u.email AS vendedor_email
            FROM publicaciones p

            INNER JOIN usuarios u
                ON p.vendedor_id = u.id

            ORDER BY p.fecha DESC
            `
        );

        return result.rows;
    }


    // Publicaciones de un vendedor concreto
    async findBySellerId(vendedorId) {
        const result = await db.query(
            `
            SELECT
                id,
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado,
                fecha
            FROM publicaciones

            WHERE vendedor_id = $1

            ORDER BY fecha DESC
            `,
            [vendedorId]
        );

        return result.rows;
    }


    async findById(id) {
        const result = await db.query(
            `
            SELECT
                id,
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado,
                fecha
            FROM publicaciones

            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }


    /*
     * IMPORTANTE:
     *
     * Incluimos vendedor_id en el WHERE.
     *
     * Esto impide que un vendedor modifique
     * una publicación perteneciente a otro.
     */
    async update(
        id,
        vendedorId,
        publication
    ) {
        const result = await db.query(
            `
            UPDATE publicaciones

            SET
                nombre = $1,
                descripcion = $2,
                imagen = $3,
                precio = $4,
                estado = 'pendiente'

            WHERE id = $5
              AND vendedor_id = $6

            RETURNING
                id,
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado,
                fecha
            `,
            [
                publication.nombre,
                publication.descripcion,
                publication.imagen,
                publication.precio,
                id,
                vendedorId
            ]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }


    /*
     * Igual que update:
     * solo el propietario puede eliminarla.
     */
    async delete(id, vendedorId) {
        const result = await db.query(
            `
            DELETE FROM publicaciones

            WHERE id = $1
              AND vendedor_id = $2

            RETURNING id
            `,
            [
                id,
                vendedorId
            ]
        );

        return result.rows.length > 0;
    }


    async approve(id) {
        const result = await db.query(
            `
            UPDATE publicaciones

            SET estado = 'aprobada'

            WHERE id = $1
              AND estado = 'pendiente'

            RETURNING
                id,
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado,
                fecha
            `,
            [id]
        );

        if (result.rows.length > 0) {
            return {
                alreadyProcessed: false,
                publication:
                    result.rows[0]
            };
        }

        const existing =
            await this.findById(id);

        if (!existing) {
            return null;
        }

        return {
            alreadyProcessed: true,
            publication: existing
        };
    }


    async reject(id) {
        const result = await db.query(
            `
            UPDATE publicaciones

            SET estado = 'rechazada'

            WHERE id = $1
              AND estado = 'pendiente'

            RETURNING
                id,
                vendedor_id,
                nombre,
                descripcion,
                imagen,
                precio,
                estado,
                fecha
            `,
            [id]
        );

        if (result.rows.length > 0) {
            return {
                alreadyProcessed: false,
                publication:
                    result.rows[0]
            };
        }

        const existing =
            await this.findById(id);

        if (!existing) {
            return null;
        }

        return {
            alreadyProcessed: true,
            publication: existing
        };
    }
}

module.exports =
    PublicationRepositoryAdapter;