--
-- PostgreSQL database dump adaptada para E-Tienda
-- Base de datos: api_usuarios
-- Creación de la base de datos para AWS

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: publicaciones; Type: TABLE; Schema: public; Owner: tienda_user
--

CREATE TABLE IF NOT EXISTS public.publicaciones (
    id integer NOT NULL,
    vendedor_id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text NOT NULL,
    imagen text,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT estado_publicacion_valido CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);

ALTER TABLE public.publicaciones OWNER TO tienda_user;

--
-- Name: publicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: tienda_user
--

CREATE SEQUENCE IF NOT EXISTS public.publicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.publicaciones_id_seq OWNER TO tienda_user;
ALTER SEQUENCE public.publicaciones_id_seq OWNED BY public.publicaciones.id;

--
-- Name: solicitudes_vendedor; Type: TABLE; Schema: public; Owner: tienda_user
--

CREATE TABLE IF NOT EXISTS public.solicitudes_vendedor (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT estado_solicitud_valido CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);

ALTER TABLE public.solicitudes_vendedor OWNER TO tienda_user;

--
-- Name: solicitudes_vendedor_id_seq; Type: SEQUENCE; Schema: public; Owner: tienda_user
--

CREATE SEQUENCE IF NOT EXISTS public.solicitudes_vendedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.solicitudes_vendedor_id_seq OWNER TO tienda_user;
ALTER SEQUENCE public.solicitudes_vendedor_id_seq OWNED BY public.solicitudes_vendedor.id;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: tienda_user
--

CREATE TABLE IF NOT EXISTS public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(20) DEFAULT 'cliente'::character varying NOT NULL,
    CONSTRAINT rol_valido CHECK (((rol)::text = ANY ((ARRAY['admin'::character varying, 'vendedor'::character varying, 'cliente'::character varying])::text[])))
);

ALTER TABLE public.usuarios OWNER TO tienda_user;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: tienda_user
--

CREATE SEQUENCE IF NOT EXISTS public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.usuarios_id_seq OWNER TO tienda_user;
ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;

--
-- Defaults para secuencias
--

ALTER TABLE ONLY public.publicaciones ALTER COLUMN id SET DEFAULT nextval('public.publicaciones_id_seq'::regclass);
ALTER TABLE ONLY public.solicitudes_vendedor ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_vendedor_id_seq'::regclass);
ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);

--
-- Constraints: Primary Keys & Unique
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publicaciones_pkey') THEN
        ALTER TABLE ONLY public.publicaciones ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'solicitudes_vendedor_pkey') THEN
        ALTER TABLE ONLY public.solicitudes_vendedor ADD CONSTRAINT solicitudes_vendedor_pkey PRIMARY KEY (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_pkey') THEN
        ALTER TABLE ONLY public.usuarios ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_key') THEN
        ALTER TABLE ONLY public.usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
    END IF;
END $$;

--
-- Datos para usuarios (Contraseña de los 3 usuarios: 123456)
--

INSERT INTO public.usuarios (id, nombre, email, password_hash, rol) VALUES
(1, 'Josmar Fernández', 'josmarfernandez@admin.com', '$2b$10$QOrhxZ55F4FpIMcz93T0H.POsBw9vsz0MdZl1d2Rtu6mz1ArJq9Ou', 'admin'),
(2, 'Carlos Gómez', 'carlosgomez@vendedor.com', '$2b$10$Z9xdpnn029Q.jZyeH7X0EO4Bg1lseZ64jMZLTAdAxVvgVesSL52OO', 'vendedor'),
(3, 'Edwin Sánchez', 'edwinsanchez@cliente.com', '$2b$10$7jbxRogn1OAVWFG1Ab6fE.3QSYNYHD9vGys2e3GN5//Iy6kgh0voa', 'cliente')
ON CONFLICT (email) DO NOTHING;

--
-- Datos para solicitudes_vendedor
--

INSERT INTO public.solicitudes_vendedor (id, usuario_id, estado, fecha) VALUES
(1, 2, 'aprobada', '2026-09-26 22:18:08.115557')
ON CONFLICT (id) DO NOTHING;

--
-- Datos para publicaciones
--

INSERT INTO public.publicaciones (id, vendedor_id, nombre, descripcion, imagen, estado, fecha) VALUES
(1, 2, 'Audífonos inalámbricos', 'Audífonos Bluetooth de diadema marca Sony', 'https://www.elpalaciodehierro.com/on/demandware.static/-/Sites-palacio-master-catalog/default/dw2e24fb4e/images/43282252/large/43282252_x1.jpg', 'aprobada', '2026-09-26 23:00:51.184034')
ON CONFLICT (id) DO NOTHING;

--
-- Ajustar valores de secuencias
--

SELECT pg_catalog.setval('public.publicaciones_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.publicaciones), true);
SELECT pg_catalog.setval('public.solicitudes_vendedor_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.solicitudes_vendedor), true);
SELECT pg_catalog.setval('public.usuarios_id_seq', (SELECT COALESCE(MAX(id), 3) FROM public.usuarios), true);

--
-- Foreign Keys
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_publicacion_vendedor') THEN
        ALTER TABLE ONLY public.publicaciones
            ADD CONSTRAINT fk_publicacion_vendedor FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_solicitud_usuario') THEN
        ALTER TABLE ONLY public.solicitudes_vendedor
            ADD CONSTRAINT fk_solicitud_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

--
-- Permisos para tienda_user
--

GRANT ALL PRIVILEGES ON SCHEMA public TO tienda_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tienda_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tienda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tienda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tienda_user;
