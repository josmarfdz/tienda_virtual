const nodemailer = require('nodemailer');
const EmailServicePort = require('../domain/emailServicePort');
const templates = require('./emailTemplates');

class NodemailerAdapter extends EmailServicePort {
    constructor() {
        super();
        this.from = process.env.EMAIL_FROM || process.env.SMTP_USER;
        this.adminEmail = process.env.ADMIN_EMAIL;
        this.enabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && this.from);
        this.transporter = this.enabled ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 2525),
            secure: String(process.env.SMTP_SECURE || 'false') === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        }) : null;
    }

    async send(to, subject, html) {
        if (!this.enabled) {
            console.warn(`[EMAIL] SMTP no configurado; correo omitido: "${subject}" para ${to || '(sin destinatario)'}`);
            return { skipped: true };
        }
        if (!to) throw new Error('No se configuró destinatario de correo');
        return this.transporter.sendMail({ from: this.from, to, subject, html });
    }

    async sendOrderCreated(order, customer, adminEmail = this.adminEmail) {
        const instructions = process.env.PAYMENT_INSTRUCTIONS || 'Solicita al administrador las instrucciones de pago de prueba. No realices pagos reales en este entorno académico.';
        const results = [];
        results.push(await this.send(customer.email, `E-Tienda: pedido #${order.id} recibido`,
            templates.orderCreatedCustomer(order, customer, instructions)));
        if (adminEmail) results.push(await this.send(adminEmail, `E-Tienda: nuevo pedido #${order.id}`,
            templates.orderCreatedAdmin(order, customer)));
        return results;
    }

    async sendPaymentConfirmation(order, customer) {
        return this.send(customer.email, `E-Tienda: confirmación de pago del pedido #${order.id}`,
            templates.paymentConfirmed(order, customer));
    }
}
module.exports = NodemailerAdapter;
