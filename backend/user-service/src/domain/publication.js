class Publication {
    constructor(
        id,
        vendedorId,
        nombre,
        descripcion,
        imagen = null,
        precio = 0,
        estado = 'pendiente',
        fecha = null
    ) {
        this.id = id;
        this.vendedorId = vendedorId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagen = imagen;
        this.precio = precio;
        this.estado = estado;
        this.fecha = fecha;
    }
}

module.exports = Publication;