import {
    useEffect,
    useState
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import { apiFetch } from '../services/api';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [codigoGenerado, setCodigoGenerado] =
        useState('');

    const [codigoIngresado, setCodigoIngresado] =
        useState('');

    const [mensaje, setMensaje] =
        useState('');

    const [error, setError] =
        useState('');

    const [cargando, setCargando] =
        useState(false);

    const generarCodigo = () => {
        const codigo = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        setCodigoGenerado(codigo);
        setCodigoIngresado('');
    };

    useEffect(() => {
        generarCodigo();
    }, []);

    const iniciarSesion = async (e) => {
        e.preventDefault();

        setError('');
        setMensaje('');

        if (
            codigoIngresado !==
            codigoGenerado
        ) {
            setError(
                'El código de verificación es incorrecto'
            );

            generarCodigo();
            return;
        }

        try {
            setCargando(true);

            const data = await apiFetch(
                '/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            localStorage.setItem(
                'token',
                data.token
            );

            localStorage.setItem(
                'usuario',
                JSON.stringify(
                    data.usuario
                )
            );

            setMensaje(
                'Inicio de sesión correcto'
            );

            const rol =
                data.usuario.rol;

            if (rol === 'admin') {
                navigate('/admin');

            } else if (
                rol === 'vendedor'
            ) {
                navigate('/vendedor');

            } else {
                navigate('/cliente');
            }

        } catch (error) {
            setError(error.message);

            // Generamos otro código
            // después de un intento fallido.
            generarCodigo();

        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Iniciar sesión</h1>

                <p className="subtitle">
                    Ingresa a tu cuenta
                </p>

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="alert success">
                        {mensaje}
                    </div>
                )}

                <form onSubmit={iniciarSesion}>

                    <label>
                        Correo electrónico
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
                        Contraseña
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        required
                    />

                    <div className="captcha">

                        <strong>
                            Código de verificación
                        </strong>

                        <div className="captcha-code">
                            {codigoGenerado}
                        </div>

                        <label>
                            Ingresa el código
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            value={codigoIngresado}
                            onChange={(e) => {
                                const valor =
                                    e.target.value
                                        .replace(
                                            /\D/g,
                                            ''
                                        );

                                setCodigoIngresado(
                                    valor
                                );
                            }}
                            required
                        />

                        <button
                            type="button"
                            className="captcha-refresh"
                            onClick={generarCodigo}
                        >
                            Generar otro código
                        </button>

                    </div>

                    <button
                        className="btn btn-primary full"
                        type="submit"
                        disabled={cargando}
                    >
                        {cargando
                            ? 'Ingresando...'
                            : 'Iniciar sesión'}
                    </button>

                </form>

                <p className="auth-footer">
                    ¿No tienes cuenta?{' '}

                    <Link to="/register">
                        Regístrate
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;