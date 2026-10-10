// Etiquetas y estilos compartidos de los estados de pedido.

export const ESTADOS_PEDIDO = {
    pendiente_pago: { etiqueta: 'Pendiente de pago', clase: 'status pending' },
    pagado:         { etiqueta: 'Pagado',            clase: 'status approved' },
    enviado:        { etiqueta: 'Enviado',           clase: 'status shipped' },
    cancelado:      { etiqueta: 'Cancelado',         clase: 'status rejected' }
};

// Un pedido se puede cancelar mientras NO se haya enviado.
export const puedeCancelarse = (estado) =>
    estado === 'pendiente_pago' || estado === 'pagado';

export const puedeEnviarse = (estado) => estado === 'pagado';

export function etiquetaEstado(estado) {
    return ESTADOS_PEDIDO[estado]?.etiqueta ?? estado;
}

export function claseEstado(estado) {
    return ESTADOS_PEDIDO[estado]?.clase ?? 'status pending';
}
