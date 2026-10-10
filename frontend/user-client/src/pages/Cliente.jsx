import {
    useEffect,
    useState
} from 'react';

import Navbar from '../components/Navbar';
import { apiFetch } from '../services/api';
import { claseEstado, etiquetaEstado, puedeCancelarse } from '../utils/pedidos';

function Cliente() {
    const usuario = JSON.parse(
        localStorage.getItem('usuario')
    );

    const [publicaciones, setPublicaciones] =
        useState([]);

    const [mensaje, setMensaje] =
        useState('');

    const [error, setError] =
        useState('');

    const [cargando, setCargando] =
        useState(false);

    const [carrito, setCarrito] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [checkoutMsg, setCheckoutMsg] = useState('');
    const [checkoutError, setCheckoutError] = useState('');

    const cargarPublicaciones = async () => {
        try {
            const data =
                await apiFetch(
                    '/publicaciones'
                );

            setPublicaciones(data);

        } catch (error) {
            setError(error.message);
        }
    };

    const cargarPedidos = async () => {
        try {
            const data = await apiFetch('/mis-pedidos');
            setPedidos(data);
        } catch (err) {
            // No interrumpimos la carga del catálogo si el historial falla.
            console.error(err);
        }
    };

    useEffect(() => {
        cargarPublicaciones();
        cargarPedidos();
    }, []);

    const agregarAlCarrito = (producto) => {
        setCheckoutMsg('');
        setCheckoutError('');
        setCarrito(actual => {
            const found = actual.find(item => item.id === producto.id);
            if (found) return actual.map(item => item.id === producto.id
                ? { ...item, cantidad: item.cantidad + 1 } : item);
            return [...actual, { ...producto, cantidad: 1 }];
        });
    };

    const cambiarCantidad = (id, cantidad) => {
        const n = Number(cantidad);
        if (!Number.isInteger(n) || n < 1) {
            setCarrito(actual => actual.filter(item => item.id !== id));
            return;
        }
        setCarrito(actual => actual.map(item => item.id === id
            ? { ...item, cantidad: Math.min(n, 99) } : item));
    };

    const totalCarrito = carrito.reduce((total, item) =>
        total + Number(item.precio) * item.cantidad, 0);

    const crearPedido = async () => {
        setCheckoutMsg('');
        setCheckoutError('');
        if (!carrito.length) return;
        try {
            setCargando(true);
            const data = await apiFetch('/pedidos', {
                method: 'POST',
                body: JSON.stringify({
                    items: carrito.map(item => ({
                        productId: item.id,
                        quantity: item.cantidad
                    }))
                })
            });
            setCheckoutMsg(data.msg + (data.pedido?.emailWarning ? ' ' + data.pedido.emailWarning : ''));
            setCarrito([]);
            await cargarPedidos();
        } catch (err) {
            setCheckoutError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const confirmarPago = async (pedidoId) => {
        setCheckoutMsg('');
        setCheckoutError('');
        try {
            setCargando(true);
            const data = await apiFetch(`/pedidos/${pedidoId}/confirmar-pago`, {
                method: 'POST'
            });
            setCheckoutMsg(data.msg + (data.pedido?.emailWarning ? ' ' + data.pedido.emailWarning : ''));
            await cargarPedidos();
        } catch (err) {
            setCheckoutError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cancelarPedido = async (pedidoId) => {
        if (!window.confirm(`¿Seguro que deseas cancelar el pedido #${pedidoId}? Esta acción no se puede deshacer.`)) {
            return;
        }
        setCheckoutMsg('');
        setCheckoutError('');
        try {
            setCargando(true);
            const data = await apiFetch(`/pedidos/${pedidoId}/cancelar`, {
                method: 'PATCH'
            });
            setCheckoutMsg(data.msg);
        } catch (err) {
            setCheckoutError(err.message);
        } finally {
            // Se recarga siempre: si el admin ya envió el pedido, la tabla lo refleja.
            await cargarPedidos();
            setCargando(false);
        }
    };

    const solicitarVendedor =
        async () => {

        setMensaje('');
        setError('');

        try {
            setCargando(true);

            const data =
                await apiFetch(
                    '/solicitudes-vendedor',
                    {
                        method: 'POST'
                    }
                );

            setMensaje(data.msg);

        } catch (error) {
            setError(error.message);

        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="container">

                <section className="welcome">
                    <h1>
                        Hola, {usuario.nombre}
                    </h1>

                    <p>
                        Explora las publicaciones
                        disponibles en E-Tienda.
                    </p>
                </section>

                {mensaje && (
                    <div className="alert success">
                        {mensaje}
                    </div>
                )}

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                <section className="card">
                    <h2>
                        ¿Quieres ser vendedor?
                    </h2>

                    <p>
                        Envía una solicitud al
                        administrador para comenzar
                        a publicar productos.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={
                            solicitarVendedor
                        }
                        disabled={cargando}
                    >
                        {cargando
                            ? 'Enviando...'
                            : 'Solicitar ser vendedor'}
                    </button>
                </section>

                <section>
                    <h2>
                        Publicaciones
                    </h2>

                    {publicaciones.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                Todavía no hay
                                publicaciones
                                disponibles.
                            </div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {publicaciones.map(
                                (publicacion) => (
                                    <article
                                        className="product-card"
                                        key={
                                            publicacion.id
                                        }
                                    >

                                        {publicacion.imagen ? (
                                            <img
                                                className="product-image"
                                                src={
                                                    publicacion.imagen
                                                }
                                                alt={
                                                    publicacion.nombre
                                                }
                                            />
                                        ) : (
                                            <div className="product-image-placeholder">
                                                Sin imagen
                                            </div>
                                        )}

                                        <div className="product-content">
                                            <h3>
                                                {
                                                    publicacion.nombre
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    publicacion.descripcion
                                                }
                                            </p>

                                            <p><strong>${Number(publicacion.precio || 0).toFixed(2)} MXN</strong></p>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => agregarAlCarrito(publicacion)}
                                                disabled={Number(publicacion.precio || 0) <= 0}
                                            >
                                                Añadir al carrito
                                            </button>

                                            <p className="seller">
                                                Vendedor:{' '}
                                                <strong>
                                                    {
                                                        publicacion.vendedor
                                                    }
                                                </strong>
                                            </p>
                                        </div>

                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>


                <section className="card">
                    <h2>Carrito de compras</h2>
                    {checkoutMsg && <div className="alert success">{checkoutMsg}</div>}
                    {checkoutError && <div className="alert error">{checkoutError}</div>}
                    {!carrito.length ? (
                        <p className="muted">Tu carrito está vacío.</p>
                    ) : (
                        <>
                            {carrito.map(item => (
                                <div className="cart-row" key={item.id}>
                                    <div>
                                        <strong>{item.nombre}</strong>
                                        <p className="muted">${Number(item.precio).toFixed(2)} MXN por unidad</p>
                                    </div>
                                    <label className="quantity-label">
                                        Cantidad
                                        <input type="number" min="1" max="99" value={item.cantidad}
                                            onChange={e => cambiarCantidad(item.id, e.target.value)} />
                                    </label>
                                    <strong>${(Number(item.precio) * item.cantidad).toFixed(2)} MXN</strong>
                                    <button className="btn btn-danger btn-small"
                                        onClick={() => setCarrito(actual => actual.filter(p => p.id !== item.id))}>
                                        Quitar
                                    </button>
                                </div>
                            ))}
                            <h3>Total: ${totalCarrito.toFixed(2)} MXN</h3>
                            <p className="muted">Al crear el pedido recibirás por correo el desglose y las instrucciones de pago. El pedido quedará pendiente hasta que confirmes el pago simulado.</p>
                            <button className="btn btn-primary" onClick={crearPedido} disabled={cargando}>
                                {cargando ? 'Procesando...' : 'Generar pedido'}
                            </button>
                        </>
                    )}
                </section>

                <section className="card">
                    <h2>Mis pedidos</h2>
                    {!pedidos.length ? <p className="muted">Aún no tienes pedidos.</p> : (
                        <div className="table-wrapper">
                            <table>
                                <thead><tr><th>Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead>
                                <tbody>
                                    {pedidos.map(pedido => (
                                        <tr key={pedido.id}>
                                            <td>#{pedido.id}</td>
                                            <td>{new Date(pedido.fecha).toLocaleString('es-MX')}</td>
                                            <td>${Number(pedido.total).toFixed(2)} MXN</td>
                                            <td><span className={claseEstado(pedido.estado)}>{etiquetaEstado(pedido.estado)}</span></td>
                                            <td>
                                                <div className="actions">
                                                    {pedido.estado === 'pendiente_pago' && (
                                                        <button className="btn btn-success btn-small" disabled={cargando}
                                                            onClick={() => confirmarPago(pedido.id)}>
                                                            Confirmar pago realizado
                                                        </button>
                                                    )}
                                                    {puedeCancelarse(pedido.estado) && (
                                                        <button className="btn btn-danger btn-small" disabled={cargando}
                                                            onClick={() => cancelarPedido(pedido.id)}>
                                                            Cancelar pedido
                                                        </button>
                                                    )}
                                                    {!puedeCancelarse(pedido.estado) && '—'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="muted">Esta confirmación es una simulación académica; no verifica movimientos bancarios reales. Puedes cancelar un pedido mientras no haya sido enviado.</p>
                </section>

            </main>
        </>
    );
}

export default Cliente;