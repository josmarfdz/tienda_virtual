import { useState } from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import { apiFetch } from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [nombre, setNombre] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [confirmPassword, setConfirmPassword] =
        useState('');

    const [error, setError] =
        useState('');

    const [cargando, setCargando] =
        useState(false);

    const registrar = async (e) => {
        e.preventDefault();

        setError('');

        if (
            password !==
            confirmPassword
        ) {
            setError(
                'Las contraseñas no coinciden'
            );
            return;
        }

        try {
            setCargando(true);

            await apiFetch(
                '/register',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        nombre,
                        email,
                        password
                    })
                }
            );

            alert(
                'Cuenta creada correctamente'
            );

            navigate('/login');

        } catch (error) {
            setError(error.message);

        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Crear cuenta</h1>

                <p className="subtitle">
                    Regístrate como cliente
                </p>

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                <form onSubmit={registrar}>
                    <label>
                        Nombre
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

                    <label>
                        Confirmar contraseña
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(
                                e.target.value
                            )
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary full"
                        disabled={cargando}
                    >
                        {cargando
                            ? 'Registrando...'
                            : 'Crear cuenta'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;