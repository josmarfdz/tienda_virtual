class Publication {
    constructor(
        id,
        vendedorId,
        nombre,
        descripcion,
        imagen = null,
        estado = 'pendiente',
        fecha = null
    ) {
        this.id = id;
        this.vendedorId = vendedorId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagen = imagen;
        this.estado = estado;
        this.fecha = fecha;
    }
}

module.exports = Publication;