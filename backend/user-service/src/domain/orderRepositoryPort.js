class OrderRepositoryPort {
    async createPending(customerId, items) { throw new Error('No implementado'); }
    async findByIdForCustomer(orderId, customerId) { throw new Error('No implementado'); }
    async markPaid(orderId, customerId) { throw new Error('No implementado'); }
}
module.exports = OrderRepositoryPort;
