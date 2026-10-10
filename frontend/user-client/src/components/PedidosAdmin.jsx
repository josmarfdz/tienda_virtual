import {
    useEffect,
    useState
} from 'react';

import { apiFetch } from '../services/api';

import {
    claseEstado,
    etiquetaEstado,
    puedeCancelarse,
    puedeEnviarse
} from '../utils/pedidos';

import {
    formatearMoneda
} from '../utils/formato';

const FILTROS = [
    { valor: '',               etiqueta: 'Todos' },
    { valor: 'pendiente_pago', etiqueta: 'Pendientes de pago' },
    { valor: 'pagado',         etiqueta: 'Pagados (por enviar)' },
    { valor: 'enviado',        etiqueta: 'Enviados' },
    { valor: 'cancelado',      etiqueta: 'Cancelados' }
];

function PedidosAdmin() {

    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [recarga, setRecarga] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');


    // Se vuelve a consultar al cambiar el filtro o tras una acción (recarga).
    useEffect(() => {

        // Evita que una respuesta lenta pise a una más reciente.
        let obsoleta = false;

        const consulta = filtro
            ? `?estado=${encodeURIComponent(filtro)}`
            : '';

        apiFetch(`/admin/pedidos${consulta}`)
            .then((datos) => {
                if (!obsoleta) {
                    setPedidos(datos);
                    setError('');
                }
            })
            .catch((err) => {
                if (!obsoleta) {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (!obsoleta) {
                    setCargando(false);
                }
            });

        return () => {
            obsoleta = true;
        };

    }, [filtro, recarga]);


    const cambiarFiltro = (valor) => {
        setCargando(true);
        setFiltro(valor);
    };


    const cambiarEstado = async (pedido, accion) => {

        const textoConfirmacion = accion === 'enviar'
            ? `¿Confirmas el envío del pedido #${pedido.id}?`
            : `¿Seguro que deseas cancelar el pedido #${pedido.id}? Esta acción no se puede deshacer.`;

        if (!window.confirm(textoConfirmacion)) {
            return;
        }

        setMensaje('');
        setError('');
        setProcesando(pedido.id);

        try {
            const datos = await apiFetch(
                `/admin/pedidos/${pedido.id}/${accion}`,
                { method: 'PATCH' }
            );

            setMensaje(datos.msg);

        } catch (err) {
            // Por ejemplo: el cliente canceló justo antes. Se muestra el
            // motivo y se recarga para que la tabla refleje la realidad.
            setError(err.message);
        }

        setProcesando(null);

        // Recarga la tabla (sin mostrar "Cargando…") para reflejar el estado real.
        setRecarga((n) => n + 1);
    };


    return (
        <section className="card">

            <div className="card-cabecera">
                <h2>Pedidos</h2>

                <label className="filtro-pedidos">
                    Mostrar
                    <select
                        value={filtro}
                        onChange={(e) => cambiarFiltro(e.target.value)}
                    >
                        {FILTROS.map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>
                                {opcion.etiqueta}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {mensaje && <div className="alert success">{mensaje}</div>}
            {error && <div className="alert error">{error}</div>}

            {cargando ? (
                <div className="empty-state">Cargando pedidos…</div>
            ) : pedidos.length === 0 ? (
                <div className="empty-state">
                    No hay pedidos para mostrar.
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td>#{pedido.id}</td>

                                    <td>
                                        {pedido.cliente
                                            ? (
                                                <>
                                                    {pedido.cliente}
                                                    <br />
                                                    <span className="muted">
                                                        {pedido.cliente_email}
                                                    </span>
                                                </>
                                            )
                                            : <span className="muted">Usuario eliminado</span>}
                                    </td>

                                    <td>
                                        {pedido.items.map((item, i) => (
                                            <div key={i}>
                                                {item.cantidad} × {item.nombre}
                                            </div>
                                        ))}
                                    </td>

                                    <td>
                                        {new Date(pedido.fecha).toLocaleString('es-MX')}
                                    </td>

                                    <td>{formatearMoneda(Number(pedido.total))}</td>

                                    <td>
                                        <span className={claseEstado(pedido.estado)}>
                                            {etiquetaEstado(pedido.estado)}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="actions">
                                            {puedeEnviarse(pedido.estado) && (
                                                <button
                                                    className="btn btn-success btn-small"
                                                    disabled={procesando !== null}
                                                    onClick={() => cambiarEstado(pedido, 'enviar')}
                                                >
                                                    Confirmar envío
                                                </button>
                                            )}

                                            {puedeCancelarse(pedido.estado) && (
                                                <button
                                                    className="btn btn-danger btn-small"
                                                    disabled={procesando !== null}
                                                    onClick={() => cambiarEstado(pedido, 'cancelar')}
                                                >
                                                    Cancelar
                                                </button>
                                            )}

                                            {!puedeEnviarse(pedido.estado) &&
                                                !puedeCancelarse(pedido.estado) && '—'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default PedidosAdmin;
