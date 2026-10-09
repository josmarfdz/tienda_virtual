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

    return router;
}
module.exports = createOrderController;
