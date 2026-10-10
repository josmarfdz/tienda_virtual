/**
 * Caso de uso: métricas analíticas del e-commerce.
 *
 * Reglas de negocio que viven aquí (no en SQL ni en el controlador):
 *   - Qué estados de pedido cuentan como "venta" (ingresos).
 *   - Validación y valores por defecto de los filtros.
 *   - Cálculo de porcentajes y tickets promedio.
 *
 * La agregación pesada la hace la base de datos a través del puerto.
 */

// Estados con su etiqueta visible. El orden es el de la distribución.
const ESTADOS_PEDIDO = [
    { estado: 'pendiente_pago', etiqueta: 'Pendiente' },
    { estado: 'pagado',         etiqueta: 'Pagado' },
    { estado: 'enviado',        etiqueta: 'Enviado' },
    { estado: 'cancelado',      etiqueta: 'Cancelado' }
];

// Un pedido genera ingreso cuando ya fue pagado (y también si ya se envió).
// Pendiente y Cancelado NO cuentan como venta.
const ESTADOS_CON_INGRESO = ['pagado', 'enviado'];

const AGRUPACIONES = ['dia', 'semana', 'mes'];

const DIAS_MAXIMOS = 366;
const LIMITE_MAXIMO = 10;
const LIMITE_POR_DEFECTO = 5;
const DIAS_POR_DEFECTO = 30;

const MS_POR_DIA = 24 * 60 * 60 * 1000;


// ---------- utilidades de fecha (trabajan con 'YYYY-MM-DD') ----------

function crearError(mensaje, status = 400) {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

function aUTC(texto) {
    const [a, m, d] = texto.split('-').map(Number);
    return Date.UTC(a, m - 1, d);
}

function deUTC(ms) {
    return new Date(ms).toISOString().slice(0, 10);
}

function esFechaValida(texto) {
    if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return false;
    }

    // Detecta fechas imposibles como 2026-02-31
    return deUTC(aUTC(texto)) === texto;
}

function diasEntre(desde, hasta) {
    return Math.round((aUTC(hasta) - aUTC(desde)) / MS_POR_DIA) + 1;
}

function redondear(valor) {
    return Math.round(valor * 100) / 100;
}

function dividir(numerador, denominador) {
    return denominador > 0 ? redondear(numerador / denominador) : 0;
}


class AnalyticsService {

    /**
     * @param {AnalyticsRepositoryPort} analyticsRepository
     * @param {{ zonaHoraria?: string }} opciones
     */
    constructor(analyticsRepository, opciones = {}) {
        this.analyticsRepository = analyticsRepository;
        this.zonaHoraria = opciones.zonaHoraria || 'America/Mexico_City';

        // Falla al arrancar (y no en la primera petición) si la zona es inválida.
        new Intl.DateTimeFormat('en-CA', { timeZone: this.zonaHoraria });
    }


    // =========================================
    // FILTROS
    // =========================================

    _hoy() {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: this.zonaHoraria,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    }

    /**
     * Valida los parámetros de la petición y completa los que falten.
     * Sin fechas -> últimos 30 días. Sin agrupación -> automática según
     * la longitud del rango.
     */
    _normalizarFiltros({ desde, hasta, agrupar, limite } = {}) {

        const fin = hasta || this._hoy();
        const inicio = desde || deUTC(aUTC(fin) - (DIAS_POR_DEFECTO - 1) * MS_POR_DIA);

        if (!esFechaValida(inicio) || !esFechaValida(fin)) {
            throw crearError('Las fechas deben tener el formato AAAA-MM-DD');
        }

        if (inicio > fin) {
            throw crearError('La fecha inicial no puede ser posterior a la final');
        }

        const dias = diasEntre(inicio, fin);

        if (dias > DIAS_MAXIMOS) {
            throw crearError(`El rango máximo es de ${DIAS_MAXIMOS} días`);
        }

        let agrupacion = agrupar;

        if (!agrupacion) {
            agrupacion = dias <= 31 ? 'dia' : dias <= 120 ? 'semana' : 'mes';
        }

        if (!AGRUPACIONES.includes(agrupacion)) {
            throw crearError("La agrupación debe ser 'dia', 'semana' o 'mes'");
        }

        const limiteNumero = limite === undefined || limite === ''
            ? LIMITE_POR_DEFECTO
            : Number(limite);

        if (
            !Number.isInteger(limiteNumero) ||
            limiteNumero < 1 ||
            limiteNumero > LIMITE_MAXIMO
        ) {
            throw crearError(`El límite debe ser un entero entre 1 y ${LIMITE_MAXIMO}`);
        }

        return {
            desde: inicio,
            hasta: fin,
            agrupar: agrupacion,
            limite: limiteNumero,
            zonaHoraria: this.zonaHoraria,
            estadosVenta: ESTADOS_CON_INGRESO
        };
    }


    // =========================================
    // MÉTRICAS INDIVIDUALES
    // =========================================

    async getTopProducts(params) {
        const filtros = this._normalizarFiltros(params);

        return {
            rango: { desde: filtros.desde, hasta: filtros.hasta },
            productos: await this._topProductos(filtros)
        };
    }

    async getRevenueTrend(params) {
        const filtros = this._normalizarFiltros(params);

        return {
            rango: { desde: filtros.desde, hasta: filtros.hasta, agrupar: filtros.agrupar },
            tendencia: await this.analyticsRepository.getRevenueTrend(filtros)
        };
    }

    async getOrderStatusDistribution(params) {
        const filtros = this._normalizarFiltros(params);

        return {
            rango: { desde: filtros.desde, hasta: filtros.hasta },
            ...(await this._estados(filtros))
        };
    }

    async getAverageTicket(params) {
        const filtros = this._normalizarFiltros(params);

        return {
            rango: { desde: filtros.desde, hasta: filtros.hasta },
            ...(await this._resumen(filtros))
        };
    }


    // =========================================
    // DASHBOARD COMPLETO
    // =========================================

    async getDashboard(params) {
        const filtros = this._normalizarFiltros(params);

        // Las 4 consultas son independientes: se ejecutan en paralelo.
        const [resumen, tendencia, estados, productos] = await Promise.all([
            this._resumen(filtros),
            this.analyticsRepository.getRevenueTrend(filtros),
            this._estados(filtros),
            this._topProductos(filtros)
        ]);

        return {
            rango: {
                desde: filtros.desde,
                hasta: filtros.hasta,
                agrupar: filtros.agrupar
            },
            resumen,
            tendencia,
            estados: estados.estados,
            totalPedidos: estados.totalPedidos,
            topProductos: productos
        };
    }


    // =========================================
    // PASOS INTERNOS
    // =========================================

    _topProductos(filtros) {
        return this.analyticsRepository.getTopProducts(filtros);
    }

    async _resumen(filtros) {
        const totales = await this.analyticsRepository.getSalesTotals(filtros);

        return {
            ingresosTotales: redondear(totales.ingresos),
            pedidosPagados: totales.pedidos,
            clientesActivos: totales.clientes,
            ticketPromedioPedido: dividir(totales.ingresos, totales.pedidos),
            ticketPromedioUsuario: dividir(totales.ingresosConCliente, totales.clientes)
        };
    }

    async _estados(filtros) {
        const filas = await this.analyticsRepository.getOrderStatusCounts(filtros);

        const total = filas.reduce((suma, fila) => suma + fila.cantidad, 0);

        // Siempre se devuelven los 4 estados (con 0 si no hay pedidos),
        // para que la gráfica y la leyenda sean estables.
        const estados = ESTADOS_PEDIDO.map(({ estado, etiqueta }) => {
            const fila = filas.find((f) => f.estado === estado);
            const cantidad = fila ? fila.cantidad : 0;

            return {
                estado,
                etiqueta,
                cantidad,
                monto: fila ? redondear(fila.monto) : 0,
                porcentaje: total > 0 ? redondear((cantidad / total) * 100) : 0
            };
        });

        return { totalPedidos: total, estados };
    }
}

module.exports = AnalyticsService;
module.exports.ESTADOS_CON_INGRESO = ESTADOS_CON_INGRESO;
