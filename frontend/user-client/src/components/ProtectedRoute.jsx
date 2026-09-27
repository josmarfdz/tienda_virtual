import { Navigate } from 'react-router-dom';

function ProtectedRoute({
    children,
    roles
}) {
    const token =
        localStorage.getItem('token');

    const usuarioGuardado =
        localStorage.getItem('usuario');

    if (!token || !usuarioGuardado) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    let usuario;

    try {
        usuario =
            JSON.parse(usuarioGuardado);
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        roles &&
        !roles.includes(usuario.rol)
    ) {
        return (
            <Navigate
                to={`/${usuario.rol}`}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;