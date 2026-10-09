const UserRepositoryPort =
    require('../domain/userRepositoryPort');

const db = require('./db');

class UserRepositoryAdapter extends UserRepositoryPort {

    // =========================================
    // CREATE
    // =========================================

    async create(user) {

        const result = await db.query(
            `
            INSERT INTO usuarios
            (
                nombre,
                email,
                password_hash,
                rol
            )
            VALUES ($1, $2, $3, $4)

            RETURNING
                id,
                nombre,
                email,
                rol
            `,
            [
                user.nombre,
                user.email,
                user.passwordHash,
                user.rol
            ]
        );

        return result.rows[0];
    }


    // =========================================
    // READ
    // =========================================

    async findAll() {

        const result = await db.query(
            `
            SELECT
                id,
                nombre,
                email,
                rol
            FROM usuarios
            ORDER BY id
            `
        );

        return result.rows;
    }


    // =========================================
    // BUSCAR POR EMAIL
    // =========================================

    async findByEmail(email) {

        const result = await db.query(
            `
            SELECT
                id,
                nombre,
                email,
                password_hash,
                rol
            FROM usuarios
            WHERE email = $1
            `,
            [email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }


    // =========================================
    // UPDATE
    // =========================================

    async update(id, user) {

        let result;

        if (user.passwordHash) {

            result = await db.query(
                `
                UPDATE usuarios

                SET
                    nombre = $1,
                    email = $2,
                    password_hash = $3

                WHERE id = $4

                RETURNING
                    id,
                    nombre,
                    email,
                    rol
                `,
                [
                    user.nombre,
                    user.email,
                    user.passwordHash,
                    id
                ]
            );

        } else {

            result = await db.query(
                `
                UPDATE usuarios

                SET
                    nombre = $1,
                    email = $2

                WHERE id = $3

                RETURNING
                    id,
                    nombre,
                    email,
                    rol
                `,
                [
                    user.nombre,
                    user.email,
                    id
                ]
            );
        }

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }


    // =========================================
    // DELETE
    // =========================================

async delete(id) {
    try {
        const result = await db.query(
            `DELETE FROM usuarios WHERE id = $1 RETURNING id`, [id]
        );
        return result.rows.length > 0;
    } catch (err) {
        if (err.code === '23503') {
            const error = new Error(
                'No se puede eliminar: el usuario tiene pedidos asociados'
            );
            error.status = 409;
            throw error;
        }
        throw err;
    }
}
}
module.exports = UserRepositoryAdapter;