const express = require('express');

const authMiddleware =
    require('../middleware/authMiddleware');

const requireRole =
    require('../middleware/roleMiddleware');

function createSellerRequestController(
    sellerRequestService
) {
    const router = express.Router();

    /*
     * CLIENTE
     * Solicitar convertirse en vendedor
     */
    router.post(
        '/solicitudes-vendedor',
        authMiddleware,
        requireRole('cliente'),
        async (req, res) => {
            try {

                const solicitud =
                    await sellerRequestService.create(
                        req.user.id,
                        req.user.rol
                    );

                res.status(201).json({
                    msg:
                        'Solicitud enviada correctamente',
                    solicitud
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
     * ADMIN
     * Consultar solicitudes
     */
    router.get(
        '/solicitudes-vendedor',
        authMiddleware,
        requireRole('admin'),
        async (req, res) => {
            try {

                const solicitudes =
                    await sellerRequestService
                        .getAll();

                res.json(solicitudes);

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
     * ADMIN
     * Aprobar solicitud
     */
    router.patch(
        '/solicitudes-vendedor/:id/aprobar',
        authMiddleware,
        requireRole('admin'),
        async (req, res) => {
            try {

                const solicitud =
                    await sellerRequestService
                        .approve(req.params.id);

                res.json({
                    msg:
                        'Solicitud aprobada. El usuario ahora es vendedor.',
                    solicitud
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
     * ADMIN
     * Rechazar solicitud
     */
    router.patch(
        '/solicitudes-vendedor/:id/rechazar',
        authMiddleware,
        requireRole('admin'),
        async (req, res) => {
            try {

                const solicitud =
                    await sellerRequestService
                        .reject(req.params.id);

                res.json({
                    msg:
                        'Solicitud rechazada',
                    solicitud
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
    createSellerRequestController;