class SellerRequest {
    constructor(
        id,
        usuarioId,
        estado = 'pendiente',
        fecha = null
    ) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.estado = estado;
        this.fecha = fecha;
    }
}

module.exports = SellerRequest;