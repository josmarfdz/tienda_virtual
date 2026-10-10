// Utilidades de formato y fechas para el dashboard.

const MONEDA = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'          // Cambia aquí la moneda si lo necesitas
});

const COMPACTO = new Intl.NumberFormat('es-MX', {
    notation: 'compact',
    maximumFractionDigits: 1
});

const ENTERO = new Intl.NumberFormat('es-MX');

export const formatearMoneda = (valor) => MONEDA.format(valor ?? 0);
export const formatearCompacto = (valor) => COMPACTO.format(valor ?? 0);
export const formatearEntero = (valor) => ENTERO.format(valor ?? 0);

export const formatearPorcentaje = (valor) =>
    `${(valor ?? 0).toLocaleString('es-MX', { maximumFractionDigits: 1 })} %`;


// ---------- Fechas (siempre como 'AAAA-MM-DD' en hora local) ----------

const dosDigitos = (n) => String(n).padStart(2, '0');

export function aTextoISO(fecha) {
    // OJO: no usamos toISOString() porque convierte a UTC y puede
    // mostrar el día siguiente por la noche.
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

export function deTextoISO(texto) {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
}

export function sumarDias(fecha, dias) {
    const copia = new Date(fecha);
    copia.setDate(copia.getDate() + dias);
    return copia;
}

export function diasEntre(desde, hasta) {
    const ms = deTextoISO(hasta) - deTextoISO(desde);
    return Math.round(ms / 86400000) + 1;
}

/** Rango de fechas para cada filtro rápido. */
export function calcularRango(preset) {
    const hoy = new Date();

    switch (preset) {
        case 'ultimos7':
            return { desde: aTextoISO(sumarDias(hoy, -6)), hasta: aTextoISO(hoy) };

        case 'ultimos30':
            return { desde: aTextoISO(sumarDias(hoy, -29)), hasta: aTextoISO(hoy) };

        case 'esteMes':
            return {
                desde: aTextoISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
                hasta: aTextoISO(hoy)
            };

        default:
            return null;
    }
}

/** Etiqueta corta para el eje X según la agrupación. */
export function formatearPeriodo(texto, agrupar) {
    const fecha = deTextoISO(texto);

    if (agrupar === 'mes') {
        return fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
    }

    const dia = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

    return agrupar === 'semana' ? `Sem. ${dia}` : dia;
}

export function formatearFechaLarga(texto) {
    return deTextoISO(texto).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
