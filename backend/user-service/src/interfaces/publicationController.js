const express = require('express');

const authMiddleware =
    require('../middleware/authMiddleware');

const requireRole =
    require('../middleware/roleMiddleware');

function createPublicationController(
    publicationService
) {
    const router = express.Router();


    /*
     * =====================================
     * CLIENTE / USUARIOS AUTENTICADOS
     * =====================================
     *
     * Ver publicaciones aprobadas.
     */
    router.get(
        '/publicaciones',
        authMiddleware,
        async (req, res) => {
            try {
                const publicaciones =
                    await publicationService
                        .getApproved();

                res.json(publicaciones);

            } catch (error) {
                console.error(error);

                res.status(500).json({
                    msg:
                        'Error del servidor'
                });
            }
        }
    );


    /*
     * =====================================
     * VENDEDOR
     * =====================================
     *
     * Crear publicación.
     */
    router.post(
        '/publicaciones',
        authMiddleware,
        requireRole('vendedor'),
        async (req, res) => {
            try {
                const {
                    nombre,
                    descripcion,
                    imagen
                } = req.body;

                const publicacion =
                    await publicationService
                        .create(
                            req.user.id,
                            nombre,
                            descripcion,
                            imagen
                        );

                res.status(201).json({
                    msg:
                        'Publicación enviada para aprobación',
                    publicacion
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


    /*
     * Ver las publicaciones del
     * vendedor autenticado.
     */
    router.get(
        '/mis-publicaciones',
        authMiddleware,
        requireRole('vendedor'),
        async (req, res) => {
            try {
                const publicaciones =
                    await publicationService
                        .getBySeller(
                            req.user.id
                        );

                res.json(publicaciones);

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


    /*
     * Editar una publicación propia.
     */
    router.put(
        '/publicaciones/:id',
        authMiddleware,
        requireRole('vendedor'),
        async (req, res) => {
            try {
                const {
                    nombre,
                    descripcion,
                    imagen
                } = req.body;

                const publicacion =
                    await publicationService
                        .update(
                            req.params.id,
                            req.user.id,
                            nombre,
                            descripcion,
                            imagen
                        );

                res.json({
                    msg:
                        'Publicación actualizada y enviada nuevamente a revisión',
                    publicacion
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


    /*
     * Eliminar publicación propia.
     */
    router.delete(
        '/publicaciones/:id',
        authMiddleware,
        requireRole('vendedor'),
        async (req, res) => {
            try {
                await publicationService
                    .delete(
                        req.params.id,
                        req.user.id
                    );

                res.json({
                    msg:
                        'Publicación eliminada correctamente'
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


    /*
     * =====================================
     * ADMINISTRADOR
     * =====================================
     *
     * Ver absolutamente todas las
     * publicaciones.
     */
    router.get(
        '/admin/publicaciones',
        authMiddleware,
        requireRole('admin'),
        async (req, res) => {
            try {
                const publicaciones =
                    await publicationService
                        .getAll();

                res.json(publicaciones);

            } catch (error) {
                console.error(error);

                res.status(500).json({
                    msg:
                        'Error del servidor'
                });
            }
        }
    );


    /*
     * Aprobar publicación.
     */
    router.patch(
        '/publicaciones/:id/aprobar',
        authMiddleware,
        requireRole('admin'),
        async (req, res) => {
            try {
                const publicacion =
                    await publicationService
                        .approve(
                            req.params.id
                        );

                res.json({
                    msg:
                        'Publicación aprobada',
                    publicacion
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


    /*
     * Rechazar publicación.
     */
    router.patch(
        '/publicaciones/:id/rechazar',
        authMiddleware,
        requireRole('admin'),
        async (req, res) => {
            try {
                const publicacion =
                    await publicationService
                        .reject(
                            req.params.id
                        );

                res.json({
                    msg:
                        'Publicación rechazada',
                    publicacion
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

module.exports =
    createPublicationController;