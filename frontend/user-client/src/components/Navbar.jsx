import { useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const usuarioGuardado =
        localStorage.getItem('usuario');

    let usuario = null;

    try {
        usuario = usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;
    } catch {
        usuario = null;
    }

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div>
                <h2>E-Tienda</h2>
            </div>

            <div className="navbar-user">
                {usuario && (
                    <>
                        <span>
                            {usuario.nombre}
                        </span>

                        <span className="role-badge">
                            {usuario.rol}
                        </span>
                    </>
                )}

                <button
                    className="btn btn-secondary"
                    onClick={cerrarSesion}
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}

export default Navbar;