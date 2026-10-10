import {
    useEffect,
    useMemo,
    useState
} from 'react';

import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import FiltroFechas from '../components/dashboard/FiltroFechas';
import TarjetasResumen from '../components/dashboard/TarjetasResumen';
import GraficoIngresos from '../components/dashboard/GraficoIngresos';
import GraficoEstados from '../components/dashboard/GraficoEstados';
import TablaTopProductos from '../components/dashboard/TablaTopProductos';

import { apiFetch } from '../services/api';

import {
    calcularRango,
    formatearFechaLarga
} from '../utils/formato';

const NOMBRE_AGRUPACION = {
    dia: 'por día',
    semana: 'por semana',
    mes: 'por mes'
};

function Dashboard() {

    const [preset, setPreset] = useState('ultimos30');
    const [rangoPersonalizado, setRangoPersonalizado] = useState(null);

    const [agrupar, setAgrupar] = useState('auto');
    const [limite, setLimite] = useState(5);

    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');


    // Rango efectivo: el filtro rápido o el personalizado ya aplicado.
    const rango = useMemo(
        () =>
            preset === 'personalizado'
                ? rangoPersonalizado
                : calcularRango(preset),
        [preset, rangoPersonalizado]
    );


    useEffect(() => {

        // Rango personalizado todavía sin aplicar: no hay nada que pedir.
        if (!rango) {
            return;
        }

        // Si el usuario cambia de filtro mientras llega una respuesta,
        // se cancela la petición vieja para que no pise a la nueva.
        const controlador = new AbortController();

        const params = new URLSearchParams({
            desde: rango.desde,
            hasta: rango.hasta,
            limite
        });

        if (agrupar !== 'auto') {
            params.set('agrupar', agrupar);
        }

        apiFetch(
            `/admin/analytics/dashboard?${params}`,
            { signal: controlador.signal }
        )
            .then((respuesta) => {
                setDatos(respuesta);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            });

        return () => controlador.abort();

    }, [rango, agrupar, limite]);


    // Cada cambio de filtro marca "cargando" desde el propio evento.
    const cambiarPreset = (nuevo) => {

        // Pulsar el filtro ya activo no cambia el rango: no hay nada que recargar.
        if (nuevo === preset) {
            return;
        }

        setCargando(nuevo !== 'personalizado' || Boolean(rangoPersonalizado));
        setPreset(nuevo);
    };

    const aplicarRango = (nuevoRango) => {
        setCargando(true);
        setRangoPersonalizado(nuevoRango);
    };

    const cambiarAgrupar = (valor) => {
        setCargando(true);
        setAgrupar(valor);
    };

    const cambiarLimite = (valor) => {
        setCargando(true);
        setLimite(valor);
    };


    const sinRangoAun = preset === 'personalizado' && !rangoPersonalizado;


    return (
        <>
            <Navbar />

            <main className="container">

                <section className="welcome dashboard-titulo">
                    <div>
                        <h1>Dashboard de ventas</h1>

                        <p>
                            {datos
                                ? `${formatearFechaLarga(datos.rango.desde)} al ${formatearFechaLarga(datos.rango.hasta)} · ingresos ${NOMBRE_AGRUPACION[datos.rango.agrupar]}`
                                : 'Métricas de rendimiento comercial de E-Tienda.'}
                        </p>
                    </div>

                    <Link to="/admin" className="btn btn-secondary">
                        ← Volver al panel
                    </Link>
                </section>

                <FiltroFechas
                    preset={preset}
                    onPreset={cambiarPreset}
                    onAplicarRango={aplicarRango}
                    agrupar={agrupar}
                    onAgrupar={cambiarAgrupar}
                    limite={limite}
                    onLimite={cambiarLimite}
                    deshabilitado={cargando}
                />

                {error && (
                    <div className="alert error">{error}</div>
                )}

                {sinRangoAun && !datos && (
                    <div className="empty-state">
                        Elige las fechas y pulsa “Aplicar” para ver las métricas.
                    </div>
                )}

                {cargando && !datos && !sinRangoAun && (
                    <div className="empty-state">Cargando métricas…</div>
                )}

                {datos && (
                    <div
                        className={
                            cargando
                                ? 'dashboard-contenido actualizando'
                                : 'dashboard-contenido'
                        }
                        aria-busy={cargando}
                    >
                        <TarjetasResumen resumen={datos.resumen} />

                        <div className="dashboard-grid">
                            <GraficoIngresos
                                tendencia={datos.tendencia}
                                agrupar={datos.rango.agrupar}
                            />

                            <GraficoEstados
                                estados={datos.estados}
                                totalPedidos={datos.totalPedidos}
                            />
                        </div>

                        <TablaTopProductos productos={datos.topProductos} />
                    </div>
                )}
            </main>
        </>
    );
}

export default Dashboard;
