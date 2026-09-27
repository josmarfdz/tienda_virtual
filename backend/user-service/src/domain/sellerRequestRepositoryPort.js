class SellerRequestRepositoryPort {

    async create(sellerRequest) {
        throw new Error(
            'Método create no implementado'
        );
    }

    async findAll() {
        throw new Error(
            'Método findAll no implementado'
        );
    }

    async findPendingByUserId(usuarioId) {
        throw new Error(
            'Método findPendingByUserId no implementado'
        );
    }

    async findById(id) {
        throw new Error(
            'Método findById no implementado'
        );
    }

    async approve(id) {
        throw new Error(
            'Método approve no implementado'
        );
    }

    async reject(id) {
        throw new Error(
            'Método reject no implementado'
        );
    }
}

module.exports = SellerRequestRepositoryPort;