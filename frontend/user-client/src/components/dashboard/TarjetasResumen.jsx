import {
    formatearEntero,
    formatearMoneda
} from '../../utils/formato';

function Tarjeta({ titulo, valor, detalle }) {
    return (
        <div className="kpi">
            <span className="kpi-titulo">{titulo}</span>
            <strong className="kpi-valor">{valor}</strong>
            {detalle && <span className="kpi-detalle">{detalle}</span>}
        </div>
    );
}

function TarjetasResumen({ resumen }) {
    return (
        <section className="kpi-grid">
            <Tarjeta
                titulo="Ingresos totales"
                valor={formatearMoneda(resumen.ingresosTotales)}
                detalle="Pedidos pagados y enviados"
            />

            <Tarjeta
                titulo="Pedidos con venta"
                valor={formatearEntero(resumen.pedidosPagados)}
                detalle="Excluye pendientes y cancelados"
            />

            <Tarjeta
                titulo="Ticket promedio por pedido"
                valor={formatearMoneda(resumen.ticketPromedioPedido)}
            />

            <Tarjeta
                titulo="Ticket promedio por usuario"
                valor={formatearMoneda(resumen.ticketPromedioUsuario)}
                detalle={`${formatearEntero(resumen.clientesActivos)} clientes con compras`}
            />
        </section>
    );
}

export default TarjetasResumen;
