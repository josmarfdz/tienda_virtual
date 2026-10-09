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
}
module.exports = OrderService;
