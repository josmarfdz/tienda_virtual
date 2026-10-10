const express = require('express');

const authMiddleware =
    require('../middleware/authMiddleware');

const requireRole =
    require('../middleware/roleMiddleware');


function createAnalyticsController(analyticsService) {

    const router = express.Router();

    // Todo el subsistema analítico es exclusivo del administrador.
    router.use(
        '/admin/analytics',
        authMiddleware,
        requireRole('admin')
    );

    /**
     * Crea un GET que lee ?desde&hasta&agrupar&limite de la URL,
     * llama al caso de uso indicado y responde en JSON.
     */
    function ruta(path, metodo) {

        router.get(`/admin/analytics/${path}`, async (req, res) => {

            try {

                const { desde, hasta, agrupar, limite } = req.query;

                const resultado =
                    await analyticsService[metodo]({
                        desde,
                        hasta,
                        agrupar,
                        limite
                    });

                res.json(resultado);

            } catch (error) {

                console.error('Error en analítica:', error);

                // No exponemos mensajes internos de la base de datos.
                const mensaje = error.status
                    ? error.message
                    : 'Error al calcular las métricas';

                res.status(error.status || 500).json({ msg: mensaje });
            }
        });
    }

    ruta('dashboard',        'getDashboard');
    ruta('top-productos',    'getTopProducts');
    ruta('ingresos',         'getRevenueTrend');
    ruta('estados-pedidos',  'getOrderStatusDistribution');
    ruta('ticket-promedio',  'getAverageTicket');

    return router;
}

module.exports = createAnalyticsController;
