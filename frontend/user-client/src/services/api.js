const API_URL = 'http://localhost:3000';

export async function apiFetch(
    endpoint,
    options = {}
) {
    const token =
        localStorage.getItem('token');

    const headers = {
        ...options.headers
    };

    // Solo agregamos Content-Type cuando
    // realmente estamos enviando un body.
    if (options.body) {
        headers['Content-Type'] =
            'application/json';
    }

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(
            data?.msg ||
            'Error en la solicitud'
        );

        error.status = response.status;

        throw error;
    }

    return data;
}