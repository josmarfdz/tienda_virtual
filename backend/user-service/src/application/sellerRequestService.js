const SellerRequest =
    require('../domain/sellerRequest');

class SellerRequestService {

    constructor(sellerRequestRepository) {
        this.sellerRequestRepository =
            sellerRequestRepository;
    }

    async create(usuarioId, rol) {

        if (!usuarioId) {
            const error =
                new Error('Usuario no válido');

            error.status = 400;
            throw error;
        }

        if (rol !== 'cliente') {
            const error =
                new Error(
                    'Solo los clientes pueden solicitar ser vendedores'
                );

            error.status = 403;
            throw error;
        }

        const pending =
            await this.sellerRequestRepository
                .findPendingByUserId(usuarioId);

        if (pending) {
            const error =
                new Error(
                    'Ya tienes una solicitud pendiente'
                );

            error.status = 409;
            throw error;
        }

        const sellerRequest =
            new SellerRequest(
                null,
                usuarioId,
                'pendiente'
            );

        return await this
            .sellerRequestRepository
            .create(sellerRequest);
    }

    async getAll() {
        return await this
            .sellerRequestRepository
            .findAll();
    }

    async approve(id) {

        if (!id) {
            const error =
                new Error('ID requerido');

            error.status = 400;
            throw error;
        }

        const result =
            await this
                .sellerRequestRepository
                .approve(id);

        if (!result) {
            const error =
                new Error(
                    'Solicitud no encontrada'
                );

            error.status = 404;
            throw error;
        }

        if (result.alreadyProcessed) {
            const error =
                new Error(
                    'La solicitud ya fue procesada'
                );

            error.status = 409;
            throw error;
        }

        return result.request;
    }

    async reject(id) {

        if (!id) {
            const error =
                new Error('ID requerido');

            error.status = 400;
            throw error;
        }

        const result =
            await this
                .sellerRequestRepository
                .reject(id);

        if (!result) {
            const error =
                new Error(
                    'Solicitud no encontrada'
                );

            error.status = 404;
            throw error;
        }

        if (result.alreadyProcessed) {
            const error =
                new Error(
                    'La solicitud ya fue procesada'
                );

            error.status = 409;
            throw error;
        }

        return result.request;
    }
}

module.exports = SellerRequestService;