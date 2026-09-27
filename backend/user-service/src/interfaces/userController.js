const express = require('express');

const authMiddleware =
    require('../middleware/authMiddleware');

const requireRole =
    require('../middleware/roleMiddleware');


function createUserController(userService) {

    const router = express.Router();


    // =========================================
    // REGISTER
    // Público
    // =========================================

    router.post(
        '/register',

        async (req, res) => {

            try {

                const {
                    nombre,
                    email,
                    password
                } = req.body;


                const user =
                    await userService.register(
                        nombre,
                        email,
                        password
                    );


                res.status(201).json({
                    msg: 'Usuario registrado',
                    usuario: user
                });

            } catch (error) {

                console.error(error);


                res.status(
                    error.status || 500
                ).json({
                    msg:
                        error.message ||
                        'Error del servidor'
                });
            }
        }
    );


    // =========================================
    // LOGIN
    // Público
    // =========================================

    router.post(
        '/login',

        async (req, res) => {

            try {

                const {
                    email,
                    password
                } = req.body;


                const resultado =
                    await userService.login(
                        email,
                        password
                    );


                res.json({
                    msg: 'Login exitoso',

                    token:
                        resultado.token,

                    usuario:
                        resultado.usuario
                });

            } catch (error) {

                console.error(error);


                res.status(
                    error.status || 500
                ).json({
                    msg:
                        error.message ||
                        'Error del servidor'
                });
            }
        }
    );


    // =========================================
    // GET USUARIOS
    // SOLO ADMIN
    // =========================================

    router.get(
        '/usuarios',

        authMiddleware,
        requireRole('admin'),

        async (req, res) => {

            try {

                const usuarios =
                    await userService.getAll();


                res.json(usuarios);

            } catch (error) {

                console.error(error);


                res.status(500).json({
                    msg: 'Error del servidor'
                });
            }
        }
    );


    // =========================================
    // PUT USUARIO
    // SOLO ADMIN
    // =========================================

    router.put(
        '/usuarios/:id',

        authMiddleware,
        requireRole('admin'),

        async (req, res) => {

            try {

                const { id } = req.params;

                const {
                    nombre,
                    email,
                    password
                } = req.body;


                const usuario =
                    await userService.update(
                        id,
                        nombre,
                        email,
                        password
                    );


                res.json({
                    msg:
                        'Usuario actualizado correctamente',

                    usuario
                });

            } catch (error) {

                console.error(error);


                res.status(
                    error.status || 500
                ).json({
                    msg:
                        error.message ||
                        'Error del servidor'
                });
            }
        }
    );


    // =========================================
    // DELETE USUARIO
    // SOLO ADMIN
    // =========================================

    router.delete(
        '/usuarios/:id',

        authMiddleware,
        requireRole('admin'),

        async (req, res) => {

            try {

                const { id } = req.params;


                await userService.delete(id);


                res.json({
                    msg:
                        'Usuario eliminado correctamente'
                });

            } catch (error) {

                console.error(error);


                res.status(
                    error.status || 500
                ).json({
                    msg:
                        error.message ||
                        'Error del servidor'
                });
            }
        }
    );


    return router;
}

module.exports = createUserController;