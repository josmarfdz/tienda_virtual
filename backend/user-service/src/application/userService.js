const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../domain/user');

class UserService {

    constructor(userRepository) {
        this.userRepository = userRepository;
    }


    // =========================================
    // REGISTRO
    // =========================================

    async register(nombre, email, password) {

        if (!nombre || !email || !password) {

            const error = new Error(
                'Faltan datos'
            );

            error.status = 400;

            throw error;
        }


        const existente =
            await this.userRepository.findByEmail(
                email
            );


        if (existente) {

            const error = new Error(
                'El correo ya existe'
            );

            error.status = 409;

            throw error;
        }


        const passwordHash =
            await bcrypt.hash(password, 10);


        /*
         * IMPORTANTE:
         *
         * Todo usuario registrado desde la API
         * comienza como cliente.
         *
         * No aceptamos un rol enviado por React.
         */

        const user = new User(
            null,
            nombre,
            email,
            passwordHash,
            'cliente'
        );


        return await this.userRepository.create(
            user
        );
    }


    // =========================================
    // OBTENER USUARIOS
    // =========================================

    async getAll() {

        return await this.userRepository.findAll();
    }


    // =========================================
    // ACTUALIZAR
    // =========================================

    async update(
        id,
        nombre,
        email,
        password
    ) {

        if (!id || !nombre || !email) {

            const error = new Error(
                'Faltan datos'
            );

            error.status = 400;

            throw error;
        }


        let passwordHash = null;


        if (password) {

            passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );
        }


        const actualizado =
            await this.userRepository.update(
                id,
                {
                    nombre,
                    email,
                    passwordHash
                }
            );


        if (!actualizado) {

            const error = new Error(
                'Usuario no encontrado'
            );

            error.status = 404;

            throw error;
        }


        return actualizado;
    }


    // =========================================
    // ELIMINAR
    // =========================================

    async delete(id) {

        if (!id) {

            const error = new Error(
                'ID requerido'
            );

            error.status = 400;

            throw error;
        }


        const eliminado =
            await this.userRepository.delete(id);


        if (!eliminado) {

            const error = new Error(
                'Usuario no encontrado'
            );

            error.status = 404;

            throw error;
        }


        return true;
    }


    // =========================================
    // LOGIN
    // =========================================

    async login(email, password) {

        if (!email || !password) {

            const error = new Error(
                'Faltan datos'
            );

            error.status = 400;

            throw error;
        }


        const user =
            await this.userRepository.findByEmail(
                email
            );


        if (!user) {

            const error = new Error(
                'Credenciales incorrectas'
            );

            error.status = 401;

            throw error;
        }


        const valid =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!valid) {

            const error = new Error(
                'Credenciales incorrectas'
            );

            error.status = 401;

            throw error;
        }


        // El JWT ahora contiene también el rol.

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '1h'
            }
        );


        return {
            token,

            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        };
    }
}

module.exports = UserService;