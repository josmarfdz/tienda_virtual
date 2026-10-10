class OrderService {
    constructor(orderRepository, emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    async createPending(customerId, items) {
        if (!Array.isArray(items) || items.length === 0) {
            const error = new Error('El carrito está vacío');
            error.status = 400;
            throw error;
        }
        const order = await this.orderRepository.createPending(customerId, items);
        const customer = { nombre: order.cliente, email: order.cliente_email };
        try {
            await this.emailService.sendOrderCreated(order, customer);
        } catch (error) {
            // La orden ya quedó guardada: no la eliminamos si SMTP falla.
            console.error(`Pedido #${order.id} creado, pero falló la notificación:`, error.message);
            order.emailWarning = 'El pedido se guardó, pero no se pudo enviar el correo. Contacta al administrador.';
        }
        return order;
    }

    async confirmPayment(orderId, customerId) {
        const current = await this.orderRepository.findByIdForCustomer(orderId, customerId);
        if (!current) {
            const error = new Error('Pedido no encontrado');
            error.status = 404;
            throw error;
        }
        if (current.estado === 'pagado') {
            const error = new Error('Este pedido ya fue marcado como pagado');
            error.status = 409;
            throw error;
        }
        if (current.estado !== 'pendiente_pago') {
            const error = new Error(
                current.estado === 'cancelado'
                    ? 'Este pedido fue cancelado y ya no puede pagarse'
                    : 'Este pedido ya no admite pagos'
            );
            error.status = 409;
            throw error;
        }
        const order = await this.orderRepository.markPaid(orderId, customerId);
        if (!order) {
            const error = new Error('No fue posible actualizar el estado del pedido');
            error.status = 409;
            throw error;
        }
        try {
            await this.emailService.sendPaymentConfirmation(order, {
                nombre: order.cliente, email: order.cliente_email
            });
        } catch (error) {
            console.error(`Pedido #${order.id} marcado como pagado, pero falló el correo:`, error.message);
            order.emailWarning = 'El pago simulado se registró, pero no se pudo enviar el correo de confirmación.';
        }
        return order;
    }

    async listMine(customerId) {
        return this.orderRepository.listByCustomer(customerId);
    }

    // =========================================
    // ADMINISTRACIÓN: listado, envío y cancelación
    // =========================================

    async listAll(estado) {
        if (estado && !ESTADOS_VALIDOS.includes(estado)) {
            throw crearError('Estado de pedido no válido', 400);
        }
        return this.orderRepository.listAll({ estado: estado || null });
    }

    // Solo se puede enviar un pedido que ya está pagado.
    async confirmShipment(orderId) {
        return this._cambiarEstado(orderId, {
            from: ['pagado'],
            to: 'enviado'
        });
    }

    // El administrador puede cancelar mientras no se haya enviado.
    async cancelByAdmin(orderId) {
        return this._cambiarEstado(orderId, {
            from: ESTADOS_CANCELABLES,
            to: 'cancelado'
        });
    }

    // El cliente puede cancelar sus propios pedidos mientras no se hayan enviado.
    async cancelByCustomer(orderId, customerId) {
        return this._cambiarEstado(orderId, {
            from: ESTADOS_CANCELABLES,
            to: 'cancelado',
            customerId
        });
    }

    async _cambiarEstado(orderId, { from, to, customerId = null }) {
        const id = Number(orderId);

        if (!Number.isSafeInteger(id) || id < 1) {
            throw crearError('Identificador de pedido no válido', 400);
        }

        const cambiado = await this.orderRepository.transition(id, { from, to, customerId });

        const actual = await this.orderRepository.findById(id);

        if (cambiado) {
            return actual;
        }

        // No se pudo cambiar: ¿no existe / no es suyo, o está en un estado que no lo permite?
        // (Para un cliente, el pedido ajeno se reporta como "no encontrado".)
        if (!actual || (customerId !== null && actual.cliente_id !== customerId)) {
            throw crearError('Pedido no encontrado', 404);
        }

        throw crearError(mensajeConflicto(actual.estado, to), 409);
    }
}

const ESTADOS_VALIDOS = ['pendiente_pago', 'pagado', 'enviado', 'cancelado'];
const ESTADOS_CANCELABLES = ['pendiente_pago', 'pagado'];

function crearError(mensaje, status) {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

function mensajeConflicto(estadoActual, destino) {
    if (destino === 'enviado') {
        if (estadoActual === 'pendiente_pago') return 'El pedido aún no está pagado; no se puede enviar';
        if (estadoActual === 'enviado') return 'El pedido ya fue marcado como enviado';
        return 'El pedido está cancelado; no se puede enviar';
    }
    if (estadoActual === 'enviado') return 'El pedido ya fue enviado y no puede cancelarse';
    return 'El pedido ya estaba cancelado';
}
module.exports = OrderService;
