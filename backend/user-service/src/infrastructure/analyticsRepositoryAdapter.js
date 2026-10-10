const AnalyticsRepositoryPort =
    require('../domain/analyticsRepositoryPort');

const db = require('./db');

/**
 * Adaptador PostgreSQL del puerto analítico.
 *
 * Toda la agregación (SUM, COUNT, GROUP BY, filtros de fecha) se hace
 * en la base de datos: a Node solo llegan filas ya resumidas.
 *
 * Seguridad: todos los valores viajan como parámetros ($1, $2...).
 * Lo único que se concatena en el SQL son fragmentos fijos definidos
 * aquí mismo (nunca texto que venga del usuario).
 */

// 'dia' | 'semana' | 'mes' -> argumento de date_trunc de PostgreSQL
const UNIDAD_SQL = {
    dia: 'day',
    semana: 'week',
    mes: 'month'
};

/**
 * Condición de rango sobre pedidos.fecha.
 * El rango [desde 00:00, hasta+1 00:00) se calcula en la zona horaria
 * indicada y se compara contra la columna "tal cual", de modo que
 * PostgreSQL puede usar los índices idx_pedidos_fecha / estado_fecha.
 */
function condicionRango(pDesde, pHasta, pZona) {
    return `
        p.fecha >= (${pDesde}::date)::timestamp AT TIME ZONE ${pZona}
        AND p.fecha < ((${pHasta}::date) + 1)::timestamp AT TIME ZONE ${pZona}
    `;
}

class AnalyticsRepositoryAdapter extends AnalyticsRepositoryPort {

    // =========================================
    // TOP DE PRODUCTOS
    // =========================================

    async getTopProducts({
        desde, hasta, zonaHoraria, estadosVenta, limite
    }) {

        // Se agrupa por publicación; si la publicación fue eliminada
        // (publicacion_id = NULL) se agrupa por el nombre guardado
        // en el pedido, para no perder esas ventas históricas.
        const result = await db.query(
            `
            SELECT
                MAX(pi.publicacion_id)  AS publicacion_id,
                MAX(pi.nombre_producto) AS nombre,
                SUM(pi.cantidad)        AS unidades,
                SUM(pi.subtotal)        AS monto
            FROM pedido_items pi
            JOIN pedidos p ON p.id = pi.pedido_id
            WHERE p.estado = ANY($4::text[])
              AND ${condicionRango('$1', '$2', '$3')}
            GROUP BY COALESCE(
                pi.publicacion_id::text,
                'sin-id:' || pi.nombre_producto
            )
            ORDER BY unidades DESC, monto DESC, nombre ASC
            LIMIT $5
            `,
            [desde, hasta, zonaHoraria, estadosVenta, limite]
        );

        return result.rows.map((fila) => ({
            publicacionId: fila.publicacion_id,
            nombre: fila.nombre,
            unidades: Number(fila.unidades),
            monto: Number(fila.monto)
        }));
    }


    // =========================================
    // TENDENCIA DE INGRESOS
    // =========================================

    async getRevenueTrend({
        desde, hasta, zonaHoraria, estadosVenta, agrupar
    }) {

        const unidad = UNIDAD_SQL[agrupar];

        if (!unidad) {
            throw new Error(`Agrupación no soportada: ${agrupar}`);
        }

        // "serie" genera todos los periodos del rango para que los
        // días/semanas/meses sin ventas aparezcan con 0 en la gráfica.
        const result = await db.query(
            `
            WITH serie AS (
                SELECT generate_series(
                    date_trunc($3::text, $1::date::timestamp),
                    date_trunc($3::text, $2::date::timestamp),
                    ('1 ' || $3::text)::interval
                ) AS periodo
            ),
            ventas AS (
                SELECT
                    date_trunc($3::text, p.fecha AT TIME ZONE $4) AS periodo,
                    SUM(p.total) AS ingresos,
                    COUNT(*)     AS pedidos
                FROM pedidos p
                WHERE p.estado = ANY($5::text[])
                  AND ${condicionRango('$1', '$2', '$4')}
                GROUP BY 1
            )
            SELECT
                to_char(s.periodo, 'YYYY-MM-DD') AS periodo,
                COALESCE(v.ingresos, 0)          AS ingresos,
                COALESCE(v.pedidos, 0)           AS pedidos
            FROM serie s
            LEFT JOIN ventas v ON v.periodo = s.periodo
            ORDER BY s.periodo
            `,
            [desde, hasta, unidad, zonaHoraria, estadosVenta]
        );

        return result.rows.map((fila) => ({
            periodo: fila.periodo,
            ingresos: Number(fila.ingresos),
            pedidos: Number(fila.pedidos)
        }));
    }


    // =========================================
    // PEDIDOS POR ESTADO
    // =========================================

    async getOrderStatusCounts({ desde, hasta, zonaHoraria }) {

        const result = await db.query(
            `
            SELECT
                p.estado,
                COUNT(*)                 AS cantidad,
                COALESCE(SUM(p.total), 0) AS monto
            FROM pedidos p
            WHERE ${condicionRango('$1', '$2', '$3')}
            GROUP BY p.estado
            `,
            [desde, hasta, zonaHoraria]
        );

        return result.rows.map((fila) => ({
            estado: fila.estado,
            cantidad: Number(fila.cantidad),
            monto: Number(fila.monto)
        }));
    }


    // =========================================
    // TOTALES (base del ticket promedio)
    // =========================================

    async getSalesTotals({
        desde, hasta, zonaHoraria, estadosVenta
    }) {

        // Los pedidos con cliente_id NULL (usuario eliminado) cuentan
        // para los ingresos y para el ticket por pedido, pero no para
        // el ticket por usuario, porque ya no hay a quién atribuirlos.
        const result = await db.query(
            `
            SELECT
                COALESCE(SUM(p.total), 0) AS ingresos,
                COUNT(*)                  AS pedidos,
                COUNT(DISTINCT p.cliente_id) AS clientes,
                COALESCE(
                    SUM(p.total) FILTER (WHERE p.cliente_id IS NOT NULL),
                    0
                ) AS ingresos_con_cliente
            FROM pedidos p
            WHERE p.estado = ANY($4::text[])
              AND ${condicionRango('$1', '$2', '$3')}
            `,
            [desde, hasta, zonaHoraria, estadosVenta]
        );

        const fila = result.rows[0];

        return {
            ingresos: Number(fila.ingresos),
            pedidos: Number(fila.pedidos),
            clientes: Number(fila.clientes),
            ingresosConCliente: Number(fila.ingresos_con_cliente)
        };
    }
}

module.exports = AnalyticsRepositoryAdapter;
