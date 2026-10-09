class EmailServicePort {
    async sendOrderCreated(order, customer, adminEmail) {
        throw new Error('Método sendOrderCreated no implementado');
    }

    async sendPaymentConfirmation(order, customer) {
        throw new Error('Método sendPaymentConfirmation no implementado');
    }
}
module.exports = EmailServicePort;
