import {
    useEffect,
    useState
} from 'react';

import Navbar from '../components/Navbar';
import { apiFetch } from '../services/api';

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

    useEffect(() => {
        cargarPublicaciones();
    }, []);

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

            </main>
        </>
    );
}

export default Cliente;