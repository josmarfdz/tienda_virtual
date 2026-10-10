import {
    useEffect,
    useState
} from 'react';

import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import PedidosAdmin from '../components/PedidosAdmin';
import { apiFetch } from '../services/api';

function Admin() {

    const [usuarios, setUsuarios] =
        useState([]);

    const [solicitudes, setSolicitudes] =
        useState([]);

    const [publicaciones, setPublicaciones] =
        useState([]);

    const [error, setError] =
        useState('');

    const [mensaje, setMensaje] =
        useState('');

    const [
        usuarioEditando,
        setUsuarioEditando
    ] = useState(null);

    const [nombre, setNombre] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');


    // =====================================
    // CARGAR DATOS
    // =====================================

    const cargarUsuarios = async () => {
        const data =
            await apiFetch('/usuarios');

        setUsuarios(data);
    };


    const cargarSolicitudes = async () => {
        const data =
            await apiFetch(
                '/solicitudes-vendedor'
            );

        setSolicitudes(data);
    };


    const cargarPublicaciones = async () => {
        const data =
            await apiFetch(
                '/admin/publicaciones'
            );

        setPublicaciones(data);
    };


    const cargarDatos = async () => {
        setError('');

        try {
            await Promise.all([
                cargarUsuarios(),
                cargarSolicitudes(),
                cargarPublicaciones()
            ]);

        } catch (error) {
            setError(error.message);
        }
    };


    useEffect(() => {
        cargarDatos();
    }, []);


    // =====================================
    // USUARIOS
    // =====================================

    const comenzarEdicion =
        (usuario) => {

        setUsuarioEditando(usuario);

        setNombre(usuario.nombre);
        setEmail(usuario.email);
        setPassword('');
    };


    const cancelarEdicion = () => {
        setUsuarioEditando(null);

        setNombre('');
        setEmail('');
        setPassword('');
    };


    const guardarUsuario =
        async (e) => {

        e.preventDefault();

        setError('');
        setMensaje('');

        try {
            const body = {
                nombre,
                email
            };

            if (password.trim()) {
                body.password = password;
            }

            const data =
                await apiFetch(
                    `/usuarios/${usuarioEditando.id}`,
                    {
                        method: 'PUT',
                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );

            setMensaje(data.msg);

            cancelarEdicion();

            await cargarUsuarios();

        } catch (error) {
            setError(error.message);
        }
    };


    const eliminarUsuario =
        async (id) => {

        const confirmar =
            window.confirm(
                '¿Seguro que deseas eliminar este usuario?'
            );

        if (!confirmar) {
            return;
        }

        setError('');
        setMensaje('');

        try {
            const data =
                await apiFetch(
                    `/usuarios/${id}`,
                    {
                        method: 'DELETE'
                    }
                );

            setMensaje(data.msg);

            await cargarDatos();

        } catch (error) {
            setError(error.message);
        }
    };


    // =====================================
    // SOLICITUDES DE VENDEDOR
    // =====================================

    const aprobarSolicitud =
        async (id) => {

        setError('');
        setMensaje('');

        try {
            const data =
                await apiFetch(
                    `/solicitudes-vendedor/${id}/aprobar`,
                    {
                        method: 'PATCH'
                    }
                );

            setMensaje(data.msg);

            await cargarDatos();

        } catch (error) {
            setError(error.message);
        }
    };


    const rechazarSolicitud =
        async (id) => {

        setError('');
        setMensaje('');

        try {
            const data =
                await apiFetch(
                    `/solicitudes-vendedor/${id}/rechazar`,
                    {
                        method: 'PATCH'
                    }
                );

            setMensaje(data.msg);

            await cargarDatos();

        } catch (error) {
            setError(error.message);
        }
    };


    // =====================================
    // PUBLICACIONES
    // =====================================

    const aprobarPublicacion =
        async (id) => {

        setError('');
        setMensaje('');

        try {
            const data =
                await apiFetch(
                    `/publicaciones/${id}/aprobar`,
                    {
                        method: 'PATCH'
                    }
                );

            setMensaje(data.msg);

            await cargarPublicaciones();

        } catch (error) {
            setError(error.message);
        }
    };


    const rechazarPublicacion =
        async (id) => {

        setError('');
        setMensaje('');

        try {
            const data =
                await apiFetch(
                    `/publicaciones/${id}/rechazar`,
                    {
                        method: 'PATCH'
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


    // =====================================
    // INTERFAZ
    // =====================================

    return (
        <>
            <Navbar />

            <main className="container">

                <section className="welcome">
                    <h1>
                        Panel de administración
                    </h1>

                    <p>
                        Gestiona usuarios,
                        solicitudes y publicaciones
                        de E-Tienda.
                    </p>

                    <Link
                        to="/admin/dashboard"
                        className="btn btn-primary"
                    >
                        Ver dashboard de ventas
                    </Link>
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


                {/* =========================
                    PEDIDOS (envío / cancelación)
                   ========================= */}

                <PedidosAdmin />


                {/* =========================
                    USUARIOS
                   ========================= */}

                <section className="card">

                    <h2>Usuarios</h2>

                    {usuarios.length === 0 ? (
                        <p>
                            No hay usuarios.
                        </p>
                    ) : (
                        <div className="table-wrapper">

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuarios.map(
                                        (usuario) => (
                                            <tr
                                                key={
                                                    usuario.id
                                                }
                                            >
                                                <td>
                                                    {
                                                        usuario.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        usuario.nombre
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        usuario.email
                                                    }
                                                </td>

                                                <td>
                                                    <span className="role-badge">
                                                        {
                                                            usuario.rol
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="actions">

                                                        <button
                                                            className="btn btn-small"
                                                            onClick={() =>
                                                                comenzarEdicion(
                                                                    usuario
                                                                )
                                                            }
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-small"
                                                            onClick={() =>
                                                                eliminarUsuario(
                                                                    usuario.id
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


                {/* =========================
                    EDITAR USUARIO
                   ========================= */}

                {usuarioEditando && (

                    <section className="card">

                        <h2>
                            Editar usuario
                        </h2>

                        <form
                            onSubmit={
                                guardarUsuario
                            }
                        >

                            <label>
                                Nombre
                            </label>

                            <input
                                value={nombre}
                                onChange={(e) =>
                                    setNombre(
                                        e.target.value
                                    )
                                }
                                required
                            />


                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                required
                            />


                            <label>
                                Nueva contraseña
                                (opcional)
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />


                            <div className="actions">

                                <button
                                    className="btn btn-primary"
                                    type="submit"
                                >
                                    Guardar
                                </button>

                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={
                                        cancelarEdicion
                                    }
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </section>
                )}


                {/* =========================
                    SOLICITUDES
                   ========================= */}

                <section className="card">

                    <h2>
                        Solicitudes de vendedor
                    </h2>

                    {solicitudes.length === 0 ? (
                        <p>
                            No hay solicitudes.
                        </p>
                    ) : (
                        <div className="table-wrapper">

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {solicitudes.map(
                                        (solicitud) => (
                                            <tr
                                                key={
                                                    solicitud.id
                                                }
                                            >
                                                <td>
                                                    {
                                                        solicitud.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        solicitud.nombre
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        solicitud.email
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            claseEstado(
                                                                solicitud.estado
                                                            )
                                                        }
                                                    >
                                                        {
                                                            solicitud.estado
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {solicitud.estado ===
                                                    'pendiente' ? (
                                                        <div className="actions">

                                                            <button
                                                                className="btn btn-success btn-small"
                                                                onClick={() =>
                                                                    aprobarSolicitud(
                                                                        solicitud.id
                                                                    )
                                                                }
                                                            >
                                                                Aprobar
                                                            </button>

                                                            <button
                                                                className="btn btn-danger btn-small"
                                                                onClick={() =>
                                                                    rechazarSolicitud(
                                                                        solicitud.id
                                                                    )
                                                                }
                                                            >
                                                                Rechazar
                                                            </button>

                                                        </div>
                                                    ) : (
                                                        <span className="muted">
                                                            Procesada
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>

                        </div>
                    )}

                </section>


                {/* =========================
                    PUBLICACIONES
                   ========================= */}

                <section className="card">

                    <h2>
                        Moderación de publicaciones
                    </h2>

                    {publicaciones.length === 0 ? (
                        <div className="empty-state">
                            No hay publicaciones.
                        </div>
                    ) : (
                        <div className="table-wrapper">

                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Vendedor</th>
                                        <th>Descripción</th>
                                        <th>Imagen</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
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
                                                        publicacion.vendedor
                                                    }

                                                    <br />

                                                    <span className="muted">
                                                        {
                                                            publicacion.vendedor_email
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        publicacion.descripcion
                                                    }
                                                </td>

                                                <td>
                                                    {publicacion.imagen ? (
                                                        <img
                                                            className="admin-product-image"
                                                            src={
                                                                publicacion.imagen
                                                            }
                                                            alt={
                                                                publicacion.nombre
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="muted">
                                                            Sin imagen
                                                        </span>
                                                    )}
                                                </td>

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
                                                    {publicacion.estado ===
                                                    'pendiente' ? (
                                                        <div className="actions">

                                                            <button
                                                                className="btn btn-success btn-small"
                                                                onClick={() =>
                                                                    aprobarPublicacion(
                                                                        publicacion.id
                                                                    )
                                                                }
                                                            >
                                                                Aprobar
                                                            </button>

                                                            <button
                                                                className="btn btn-danger btn-small"
                                                                onClick={() =>
                                                                    rechazarPublicacion(
                                                                        publicacion.id
                                                                    )
                                                                }
                                                            >
                                                                Rechazar
                                                            </button>

                                                        </div>
                                                    ) : (
                                                        <span className="muted">
                                                            Procesada
                                                        </span>
                                                    )}
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

export default Admin;