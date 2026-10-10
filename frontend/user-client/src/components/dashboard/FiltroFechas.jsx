import { useState } from 'react';

import { aTextoISO, diasEntre } from '../../utils/formato';

const PRESETS = [
    { id: 'ultimos7',      etiqueta: 'Últimos 7 días' },
    { id: 'ultimos30',     etiqueta: 'Últimos 30 días' },
    { id: 'esteMes',       etiqueta: 'Este mes' },
    { id: 'personalizado', etiqueta: 'Rango personalizado' }
];

const DIAS_MAXIMOS = 366;

function FiltroFechas({
    preset,
    onPreset,
    onAplicarRango,
    agrupar,
    onAgrupar,
    limite,
    onLimite,
    deshabilitado
}) {

    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [errorLocal, setErrorLocal] = useState('');

    const hoy = aTextoISO(new Date());

    const aplicar = () => {
        setErrorLocal('');

        if (!desde || !hasta) {
            setErrorLocal('Selecciona la fecha inicial y la final.');
            return;
        }

        if (desde > hasta) {
            setErrorLocal('La fecha inicial no puede ser posterior a la final.');
            return;
        }

        if (diasEntre(desde, hasta) > DIAS_MAXIMOS) {
            setErrorLocal(`El rango máximo es de ${DIAS_MAXIMOS} días.`);
            return;
        }

        onAplicarRango({ desde, hasta });
    };

    return (
        <section className="card filtros">

            <div className="filtros-fila">

                <div
                    className="chips"
                    role="group"
                    aria-label="Periodo"
                >
                    {PRESETS.map((opcion) => (
                        <button
                            key={opcion.id}
                            type="button"
                            className={
                                preset === opcion.id
                                    ? 'chip chip-activo'
                                    : 'chip'
                            }
                            aria-pressed={preset === opcion.id}
                            disabled={deshabilitado}
                            onClick={() => onPreset(opcion.id)}
                        >
                            {opcion.etiqueta}
                        </button>
                    ))}
                </div>

                <div className="filtros-selects">
                    <label>
                        Agrupar
                        <select
                            value={agrupar}
                            onChange={(e) => onAgrupar(e.target.value)}
                        >
                            <option value="auto">Automático</option>
                            <option value="dia">Por día</option>
                            <option value="semana">Por semana</option>
                            <option value="mes">Por mes</option>
                        </select>
                    </label>

                    <label>
                        Ranking
                        <select
                            value={limite}
                            onChange={(e) => onLimite(Number(e.target.value))}
                        >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                        </select>
                    </label>
                </div>
            </div>

            {preset === 'personalizado' && (
                <div className="filtros-personalizado">

                    <label>
                        Desde
                        <input
                            type="date"
                            value={desde}
                            max={hasta || hoy}
                            onChange={(e) => setDesde(e.target.value)}
                        />
                    </label>

                    <label>
                        Hasta
                        <input
                            type="date"
                            value={hasta}
                            min={desde || undefined}
                            max={hoy}
                            onChange={(e) => setHasta(e.target.value)}
                        />
                    </label>

                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={deshabilitado}
                        onClick={aplicar}
                    >
                        Aplicar
                    </button>

                    {errorLocal && (
                        <p className="filtros-error">{errorLocal}</p>
                    )}
                </div>
            )}
        </section>
    );
}

export default FiltroFechas;
