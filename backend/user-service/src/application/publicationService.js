const Publication =
    require('../domain/publication');

class PublicationService {

    constructor(publicationRepository) {
        this.publicationRepository =
            publicationRepository;
    }


    async create(
        vendedorId,
        nombre,
        descripcion,
        imagen,
        precio
    ) {
        if (
            !vendedorId ||
            !nombre ||
            !descripcion ||
            !Number.isFinite(Number(precio)) || Number(precio) <= 0
        ) {
            const error =
                new Error('Faltan datos');

            error.status = 400;
            throw error;
        }

        const publication =
            new Publication(
                null,
                vendedorId,
                nombre,
                descripcion,
                imagen || null,
                Number(precio),
                'pendiente'
            );

        return await this
            .publicationRepository
            .create(publication);
    }


    async getApproved() {
        return await this
            .publicationRepository
            .findApproved();
    }


    async getAll() {
        return await this
            .publicationRepository
            .findAll();
    }


    async getBySeller(vendedorId) {
        if (!vendedorId) {
            const error =
                new Error(
                    'Vendedor no válido'
                );

            error.status = 400;
            throw error;
        }

        return await this
            .publicationRepository
            .findBySellerId(
                vendedorId
            );
    }


    async update(
        id,
        vendedorId,
        nombre,
        descripcion,
        imagen,
        precio
    ) {
        if (
            !id ||
            !vendedorId ||
            !nombre ||
            !descripcion ||
            !Number.isFinite(Number(precio)) || Number(precio) <= 0
        ) {
            const error =
                new Error('Faltan datos');

            error.status = 400;
            throw error;
        }

        const publication = {
            nombre,
            descripcion,
            imagen: imagen || null,
            precio: Number(precio)
        };

        const updated =
            await this
                .publicationRepository
                .update(
                    id,
                    vendedorId,
                    publication
                );

        if (!updated) {
            const error =
                new Error(
                    'Publicación no encontrada o no te pertenece'
                );

            error.status = 404;
            throw error;
        }

        return updated;
    }


    async delete(id, vendedorId) {
        if (!id || !vendedorId) {
            const error =
                new Error('Faltan datos');

            error.status = 400;
            throw error;
        }

        const deleted =
            await this
                .publicationRepository
                .delete(
                    id,
                    vendedorId
                );

        if (!deleted) {
            const error =
                new Error(
                    'Publicación no encontrada o no te pertenece'
                );

            error.status = 404;
            throw error;
        }

        return true;
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
                .publicationRepository
                .approve(id);

        if (!result) {
            const error =
                new Error(
                    'Publicación no encontrada'
                );

            error.status = 404;
            throw error;
        }

        if (result.alreadyProcessed) {
            const error =
                new Error(
                    'La publicación ya fue procesada'
                );

            error.status = 409;
            throw error;
        }

        return result.publication;
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
                .publicationRepository
                .reject(id);

        if (!result) {
            const error =
                new Error(
                    'Publicación no encontrada'
                );

            error.status = 404;
            throw error;
        }

        if (result.alreadyProcessed) {
            const error =
                new Error(
                    'La publicación ya fue procesada'
                );

            error.status = 409;
            throw error;
        }

        return result.publication;
    }
}

module.exports =
    PublicationService;