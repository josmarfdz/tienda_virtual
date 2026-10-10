/**
 * Puerto de salida para consultas analíticas (solo lectura).
 *
 * Vive separado de OrderRepositoryPort a propósito: las entidades
 * operativas (Pedido, Publicación, Usuario) no se contaminan con
 * métodos de reportes, y el dominio no sabe nada de SQL.
 *
 * Todos los métodos reciben un objeto "filtros" con:
 *   desde, hasta   -> 'YYYY-MM-DD' (ambos días incluidos)
 *   zonaHoraria    -> p. ej. 'America/Mexico_City'
 * y, según el caso:
 *   estadosVenta   -> estados de pedido que cuentan como venta
 *   agrupar        -> 'dia' | 'semana' | 'mes'
 *   limite         -> máximo de filas del ranking
 */
class AnalyticsRepositoryPort {

    /** @returns {Promise<Array<{publicacionId, nombre, unidades, monto}>>} */
    async getTopProducts(filtros) {
        throw new Error('Método getTopProducts no implementado');
    }

    /** @returns {Promise<Array<{periodo, ingresos, pedidos}>>} */
    async getRevenueTrend(filtros) {
        throw new Error('Método getRevenueTrend no implementado');
    }

    /** @returns {Promise<Array<{estado, cantidad, monto}>>} */
    async getOrderStatusCounts(filtros) {
        throw new Error('Método getOrderStatusCounts no implementado');
    }

    /** @returns {Promise<{ingresos, pedidos, clientes, ingresosConCliente}>} */
    async getSalesTotals(filtros) {
        throw new Error('Método getSalesTotals no implementado');
    }
}

module.exports = AnalyticsRepositoryPort;
