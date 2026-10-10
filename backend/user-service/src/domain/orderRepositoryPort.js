class OrderRepositoryPort {
    async createPending(customerId, items) { throw new Error('No implementado'); }
    async findByIdForCustomer(orderId, customerId) { throw new Error('No implementado'); }
    async markPaid(orderId, customerId) { throw new Error('No implementado'); }

    // --- Gestión de estados (envío / cancelación) ---
    async findById(orderId) { throw new Error('No implementado'); }
    async listAll(filtros) { throw new Error('No implementado'); }
    async transition(orderId, cambio) { throw new Error('No implementado'); }
}
module.exports = OrderRepositoryPort;
