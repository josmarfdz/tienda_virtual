import {
    useEffect,
    useState
} from 'react';

import Navbar from '../components/Navbar';
import { apiFetch } from '../services/api';

function Vendedor() {
    const usuario = JSON.parse(
        localStorage.getItem('usuario')
    );

    const [publicaciones, setPublicaciones] =
        useState([]);

    const [nombre, setNombre] =
        useState('');

    const [descripcion, setDescripcion] =
        useState('');

    const [imagen, setImagen] =
        useState('');

    const [precio, setPrecio] = useState('');

    const [
        publicacionEditando,
        setPublicacionEditando
    ] = useState(null);

    const [mensaje, setMensaje] =
        useState('');

    const [error, setError] =
        useState('');

    const [cargando, setCargando] =
        useState(false);


    const cargarPublicaciones =
        async () => {

        try {
            const data =
                await apiFetch(
                    '/mis-publicaciones'
                );

            setPublicaciones(data);

        } catch (error) {
            setError(error.message);
        }
    };


    useEffect(() => {
        cargarPublicaciones();
    }, []);


    const limpiarFormulario = () => {
        setNombre('');
        setDescripcion('');
        setImagen('');
        setPrecio('');
        setPublicacionEditando(null);
    };


    const guardarPublicacion =
        async (e) => {

        e.preventDefault();

        setMensaje('');
        setError('');

        try {
            setCargando(true);

            const body = {
                nombre,
                descripcion,
                imagen,
                precio: Number(precio)
            };

            let data;

            if (publicacionEditando) {

                data = await apiFetch(
                    `/publicaciones/${publicacionEditando.id}`,
                    {
                        method: 'PUT',
                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );

            } else {

                data = await apiFetch(
                    '/publicaciones',
                    {
                        method: 'POST',
                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );
            }

            setMensaje(data.msg);

            limpiarFormulario();

            await cargarPublicaciones();

        } catch (error) {
            setError(error.message);

        } finally {
            setCargando(false);
        }
    };


    const editarPublicacion =
        (publicacion) => {

        setPublicacionEditando(
            publicacion
        );

        setNombre(
            publicacion.nombre
        );

        setDescripcion(
            publicacion.descripcion
        );

        setImagen(
            publicacion.imagen || ''
        );
        setPrecio(String(publicacion.precio ?? ''));

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    const eliminarPublicacion =
        async (id) => {

        const confirmar =
            window.confirm(
                '¿Seguro que deseas eliminar esta publicación?'
            );

        if (!confirmar) {
            return;
        }

        setMensaje('');
        setError('');

        try {
            const data =
                await apiFetch(
                    `/publicaciones/${id}`,
                    {
                        method: 'DELETE'
                    }
                );

            setMensaje(data.msg);

            await cargarPublicaciones();

        } catch (error) {
            setError(error.message);
        }
    };


    const claseEstado = (estado) => {
        if (estado === 'aprobada') {
            return 'status approved';
        }

        if (estado === 'rechazada') {
            return 'status rejected';
        }

        return 'status pending';
    };


    return (
        <>
            <Navbar />

            <main className="container">

                <section className="welcome">
                    <h1>
                        Panel de vendedor
                    </h1>

                    <p>
                        Bienvenido,{' '}
                        {usuario.nombre}.
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
                        {publicacionEditando
                            ? 'Editar publicación'
                            : 'Nueva publicación'}
                    </h2>

                    {publicacionEditando && (
                        <p className="muted">
                            Al modificar una
                            publicación será enviada
                            nuevamente a revisión.
                        </p>
                    )}

                    <form
                        onSubmit={
                            guardarPublicacion
                        }
                    >

                        <label>
                            Nombre del producto
                        </label>

                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) =>
                                setNombre(
                                    e.target.value
                                )
                            }
                            required
                        />


                        <label>
                            Descripción
                        </label>

                        <textarea
                            value={descripcion}
                            onChange={(e) =>
                                setDescripcion(
                                    e.target.value
                                )
                            }
                            required
                        />


                        <label>Precio (MXN)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            placeholder="Ej. 249.99"
                            required
                        />

                        <label>
                            URL de la imagen
                        </label>

                        <input
                            type="url"
                            value={imagen}
                            onChange={(e) =>
                                setImagen(
                                    e.target.value
                                )
                            }
                            placeholder="https://..."
                        />


                        {imagen && (
                            <div className="image-preview">
                                <p>
                                    Vista previa:
                                </p>

                                <img
                                    src={imagen}
                                    alt="Vista previa"
                                />
                            </div>
                        )}


                        <div className="actions">

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={cargando}
                            >
                                {cargando
                                    ? 'Guardando...'
                                    : publicacionEditando
                                        ? 'Guardar cambios'
                                        : 'Enviar publicación'}
                            </button>


                            {publicacionEditando && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        limpiarFormulario
                                    }
                                >
                                    Cancelar
                                </button>
                            )}

                        </div>

                    </form>
                </section>


                <section className="card">

                    <h2>
                        Mis publicaciones
                    </h2>

                    {publicaciones.length === 0 ? (
                        <div className="empty-state">
                            Todavía no has creado
                            ninguna publicación.
                        </div>
                    ) : (
                        <div className="table-wrapper">

                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            Producto
                                        </th>

                                        <th>
                                            Descripción
                                        </th>

                                        <th>Precio</th>
                                        <th>
                                            Estado
                                        </th>

                                        <th>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {publicaciones.map(
                                        (publicacion) => (
                                            <tr
                                                key={
                                                    publicacion.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            publicacion.nombre
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        publicacion.descripcion
                                                    }
                                                </td>

                                                <td>${Number(publicacion.precio || 0).toFixed(2)} MXN</td>
                                                <td>
                                                    <span
                                                        className={
                                                            claseEstado(
                                                                publicacion.estado
                                                            )
                                                        }
                                                    >
                                                        {
                                                            publicacion.estado
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="actions">

                                                        <button
                                                            className="btn btn-small"
                                                            onClick={() =>
                                                                editarPublicacion(
                                                                    publicacion
                                                                )
                                                            }
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-small"
                                                            onClick={() =>
                                                                eliminarPublicacion(
                                                                    publicacion.id
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>

                        </div>
                    )}

                </section>

            </main>
        </>
    );
}

export default Vendedor;