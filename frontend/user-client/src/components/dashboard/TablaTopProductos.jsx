import {
    formatearEntero,
    formatearMoneda
} from '../../utils/formato';

function TablaTopProductos({ productos }) {

    const maximo = Math.max(1, ...productos.map((p) => p.unidades));

    return (
        <section className="card">

            <div className="card-cabecera">
                <h2>Productos con mayor rotación</h2>
            </div>

            {productos.length === 0 ? (
                <div className="empty-state">
                    No hay productos vendidos en el periodo seleccionado.
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Unidades vendidas</th>
                                <th>Monto recaudado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {productos.map((producto, indice) => (
                                <tr key={producto.publicacionId ?? `n-${producto.nombre}`}>
                                    <td>{indice + 1}</td>

                                    <td>{producto.nombre}</td>

                                    <td>
                                        <div className="barra-unidades">
                                            <div
                                                className="barra-unidades-relleno"
                                                style={{
                                                    width: `${(producto.unidades / maximo) * 100}%`
                                                }}
                                            />
                                            <span>{formatearEntero(producto.unidades)}</span>
                                        </div>
                                    </td>

                                    <td>{formatearMoneda(producto.monto)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default TablaTopProductos;
