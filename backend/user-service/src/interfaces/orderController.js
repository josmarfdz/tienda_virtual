const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

function createOrderController(orderService) {
    const router = express.Router();

    router.post('/pedidos', authMiddleware, requireRole('cliente'), async (req, res) => {
        try {
            const order = await orderService.createPending(req.user.id, req.body.items);
            res.status(201).json({
                msg: 'Pedido creado. Revisa tu correo para consultar las instrucciones de pago.',
                pedido: order
            });
        } catch (error) {
            console.error('Error al crear pedido:', error.message);
            res.status(error.status || 500).json({ msg: error.message || 'Error al crear el pedido' });
        }
    });

    router.get('/mis-pedidos', authMiddleware, requireRole('cliente'), async (req, res) => {
        try {
            res.json(await orderService.listMine(req.user.id));
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al consultar los pedidos' });
        }
    });

    // Flujo académico simulado: el cliente declara que realizó el pago.
    // No representa una verificación bancaria real.
    router.post('/pedidos/:id/confirmar-pago', authMiddleware, requireRole('cliente'), async (req, res) => {
        try {
            const order = await orderService.confirmPayment(req.params.id, req.user.id);
            res.json({
                msg: 'Pago simulado registrado. Se envió la confirmación por correo.',
                pedido: order
            });
        } catch (error) {
            console.error('Error al confirmar pago:', error.message);
            res.status(error.status || 500).json({ msg: error.message || 'Error al confirmar el pago' });
        }
    });

    // El cliente cancela su propio pedido (solo si todavía no se envió).
    router.patch('/pedidos/:id/cancelar', authMiddleware, requireRole('cliente'), async (req, res) => {
        try {
            const order = await orderService.cancelByCustomer(req.params.id, req.user.id);
            res.json({ msg: 'Pedido cancelado correctamente', pedido: order });
        } catch (error) {
            responderError(res, error, 'Error al cancelar el pedido');
        }
    });

    // ---------- Administración de pedidos (solo admin) ----------

    router.get('/admin/pedidos', authMiddleware, requireRole('admin'), async (req, res) => {
        try {
            res.json(await orderService.listAll(req.query.estado));
        } catch (error) {
            responderError(res, error, 'Error al consultar los pedidos');
        }
    });

    router.patch('/admin/pedidos/:id/enviar', authMiddleware, requireRole('admin'), async (req, res) => {
        try {
            const order = await orderService.confirmShipment(req.params.id);
            res.json({ msg: `Envío del pedido #${order.id} confirmado`, pedido: order });
        } catch (error) {
            responderError(res, error, 'Error al confirmar el envío');
        }
    });

    router.patch('/admin/pedidos/:id/cancelar', authMiddleware, requireRole('admin'), async (req, res) => {
        try {
            const order = await orderService.cancelByAdmin(req.params.id);
            res.json({ msg: `Pedido #${order.id} cancelado`, pedido: order });
        } catch (error) {
            responderError(res, error, 'Error al cancelar el pedido');
        }
    });

    return router;
}

// Errores esperados (400/404/409) se muestran tal cual; los inesperados
// no exponen detalles internos de la base de datos.
function responderError(res, error, mensajeGenerico) {
    console.error(mensajeGenerico + ':', error.message);
    res.status(error.status || 500).json({
        msg: error.status ? error.message : mensajeGenerico
    });
}

module.exports = createOrderController;
