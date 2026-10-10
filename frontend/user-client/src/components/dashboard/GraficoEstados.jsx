import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

import {
    formatearEntero,
    formatearPorcentaje
} from '../../utils/formato';

// Un color fijo por estado para que no cambie entre filtros.
const COLORES = {
    pendiente_pago: '#f59e0b',
    pagado: '#16a34a',
    enviado: '#2563eb',
    cancelado: '#dc2626'
};

function GraficoEstados({ estados, totalPedidos }) {

    const conDatos = estados.filter((estado) => estado.cantidad > 0);

    return (
        <section className="card">

            <div className="card-cabecera">
                <h2>Estado de los pedidos</h2>
            </div>

            {totalPedidos === 0 ? (
                <div className="empty-state">
                    No hay pedidos en el periodo seleccionado.
                </div>
            ) : (
                <>
                    <div className="grafico">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={conDatos}
                                    dataKey="cantidad"
                                    nameKey="etiqueta"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={2}
                                >
                                    {conDatos.map((estado) => (
                                        <Cell
                                            key={estado.estado}
                                            fill={COLORES[estado.estado]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(valor, nombre) => [
                                        `${formatearEntero(valor)} pedidos`,
                                        nombre
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <ul className="leyenda">
                        {estados.map((estado) => (
                            <li key={estado.estado}>
                                <span
                                    className="leyenda-punto"
                                    style={{ background: COLORES[estado.estado] }}
                                />

                                <span className="leyenda-nombre">
                                    {estado.etiqueta}
                                </span>

                                <span className="leyenda-valor">
                                    {formatearEntero(estado.cantidad)}
                                    {' · '}
                                    {formatearPorcentaje(estado.porcentaje)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}

export default GraficoEstados;
