import { useState } from 'react';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import {
    formatearCompacto,
    formatearEntero,
    formatearMoneda,
    formatearPeriodo
} from '../../utils/formato';

const COLOR = '#2563eb';

function GraficoIngresos({ tendencia, agrupar }) {

    const [tipo, setTipo] = useState('barras');

    const hayVentas = tendencia.some((punto) => punto.ingresos > 0);

    const etiquetaEje = (periodo) => formatearPeriodo(periodo, agrupar);

    const comunes = (
        <>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
                dataKey="periodo"
                tickFormatter={etiquetaEje}
                tick={{ fontSize: 12 }}
                minTickGap={24}
            />

            <YAxis
                tickFormatter={formatearCompacto}
                tick={{ fontSize: 12 }}
                width={60}
            />

            <Tooltip
                labelFormatter={etiquetaEje}
                formatter={(valor, nombre) =>
                    nombre === 'Pedidos'
                        ? formatearEntero(valor)
                        : formatearMoneda(valor)
                }
            />
        </>
    );

    return (
        <section className="card">

            <div className="card-cabecera">
                <h2>Tendencia de ingresos</h2>

                <div className="chips" role="group" aria-label="Tipo de gráfico">
                    <button
                        type="button"
                        className={tipo === 'barras' ? 'chip chip-activo' : 'chip'}
                        aria-pressed={tipo === 'barras'}
                        onClick={() => setTipo('barras')}
                    >
                        Barras
                    </button>

                    <button
                        type="button"
                        className={tipo === 'linea' ? 'chip chip-activo' : 'chip'}
                        aria-pressed={tipo === 'linea'}
                        onClick={() => setTipo('linea')}
                    >
                        Línea
                    </button>
                </div>
            </div>

            {!hayVentas ? (
                <div className="empty-state">
                    No hay ventas en el periodo seleccionado.
                </div>
            ) : (
                <div className="grafico">
                    <ResponsiveContainer width="100%" height={320}>
                        {tipo === 'barras' ? (
                            <BarChart data={tendencia}>
                                {comunes}
                                <Bar
                                    dataKey="ingresos"
                                    name="Ingresos"
                                    fill={COLOR}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        ) : (
                            <LineChart data={tendencia}>
                                {comunes}
                                <Line
                                    type="monotone"
                                    dataKey="ingresos"
                                    name="Ingresos"
                                    stroke={COLOR}
                                    strokeWidth={2.5}
                                    dot={tendencia.length <= 31}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

export default GraficoIngresos;
