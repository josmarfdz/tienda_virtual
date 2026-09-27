class PublicationRepositoryPort {

    async create(publication) {
        throw new Error(
            'Método create no implementado'
        );
    }

    async findApproved() {
        throw new Error(
            'Método findApproved no implementado'
        );
    }

    async findAll() {
        throw new Error(
            'Método findAll no implementado'
        );
    }

    async findBySellerId(vendedorId) {
        throw new Error(
            'Método findBySellerId no implementado'
        );
    }

    async findById(id) {
        throw new Error(
            'Método findById no implementado'
        );
    }

    async update(id, vendedorId, publication) {
        throw new Error(
            'Método update no implementado'
        );
    }

    async delete(id, vendedorId) {
        throw new Error(
            'Método delete no implementado'
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

module.exports =
    PublicationRepositoryPort;