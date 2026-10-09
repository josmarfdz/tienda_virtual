--
-- PostgreSQL database dump
--

\restrict HrnwMqrdctoTsnbytyRYWqfRaGNrZeIccrj6f8xtRTspaRQeRugK5Fw8lH9D2cR

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_items (
    id bigint NOT NULL,
    pedido_id bigint NOT NULL,
    publicacion_id integer,
    nombre_producto character varying(150) NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    CONSTRAINT pedido_items_cantidad_check CHECK ((cantidad > 0)),
    CONSTRAINT pedido_items_precio_unitario_check CHECK ((precio_unitario >= (0)::numeric)),
    CONSTRAINT pedido_items_subtotal_check CHECK ((subtotal >= (0)::numeric))
);


ALTER TABLE public.pedido_items OWNER TO postgres;

--
-- Name: pedido_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_items_id_seq OWNER TO postgres;

--
-- Name: pedido_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_items_id_seq OWNED BY public.pedido_items.id;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id bigint NOT NULL,
    cliente_id integer,
    estado character varying(24) DEFAULT 'pendiente_pago'::character varying NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pagado_en timestamp with time zone,
    CONSTRAINT pedidos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente_pago'::character varying, 'pagado'::character varying])::text[]))),
    CONSTRAINT pedidos_total_check CHECK ((total >= (0)::numeric))
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_seq OWNER TO postgres;

--
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- Name: publicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicaciones (
    id integer NOT NULL,
    vendedor_id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text NOT NULL,
    imagen text,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    precio numeric(12,2) DEFAULT 0 NOT NULL,
    CONSTRAINT estado_publicacion_valido CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);


ALTER TABLE public.publicaciones OWNER TO postgres;

--
-- Name: publicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.publicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publicaciones_id_seq OWNER TO postgres;

--
-- Name: publicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.publicaciones_id_seq OWNED BY public.publicaciones.id;


--
-- Name: solicitudes_vendedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes_vendedor (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT estado_solicitud_valido CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);


ALTER TABLE public.solicitudes_vendedor OWNER TO postgres;

--
-- Name: solicitudes_vendedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitudes_vendedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitudes_vendedor_id_seq OWNER TO postgres;

--
-- Name: solicitudes_vendedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_vendedor_id_seq OWNED BY public.solicitudes_vendedor.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(20) DEFAULT 'cliente'::character varying NOT NULL,
    CONSTRAINT rol_valido CHECK (((rol)::text = ANY ((ARRAY['admin'::character varying, 'vendedor'::character varying, 'cliente'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: pedido_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items ALTER COLUMN id SET DEFAULT nextval('public.pedido_items_id_seq'::regclass);


--
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- Name: publicaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicaciones ALTER COLUMN id SET DEFAULT nextval('public.publicaciones_id_seq'::regclass);


--
-- Name: solicitudes_vendedor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_vendedor ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_vendedor_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: pedido_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_items (id, pedido_id, publicacion_id, nombre_producto, cantidad, precio_unitario, subtotal) FROM stdin;
1	1	2	Bendición Lunar | Genshin Impact [Digital Key]	1	109.00	109.00
2	2	2	Bendición Lunar | Genshin Impact [Digital Key]	1	109.00	109.00
3	3	1	Audífonos Sony WH-CH520	1	650.00	650.00
4	4	3	Disco de vinilo 1989 de Taylor Swift	1	600.00	600.00
5	4	2	Bendición Lunar | Genshin Impact [Digital Key]	2	109.00	218.00
6	4	1	Audífonos Sony WH-CH520	1	650.00	650.00
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, cliente_id, estado, total, fecha, pagado_en) FROM stdin;
1	\N	pagado	109.00	2026-10-09 11:57:04.933648-06	2026-10-09 11:59:45.973147-06
2	\N	pagado	109.00	2026-10-09 11:58:43.152721-06	2026-10-09 11:59:39.146802-06
3	\N	pagado	650.00	2026-10-09 12:09:05.224943-06	2026-10-09 12:09:52.793312-06
4	5	pagado	1468.00	2026-10-09 12:58:23.826951-06	2026-10-09 13:00:48.761573-06
\.


--
-- Data for Name: publicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publicaciones (id, vendedor_id, nombre, descripcion, imagen, estado, fecha, precio) FROM stdin;
2	2	Bendición Lunar | Genshin Impact [Digital Key]	Bendición Lunar para el videojuego Genshin Impact:\n30 días de Bendición Lunar, recibe 90 protogemas diarias y 300 cristales génesis al instante.	https://gamescenter.pe/wp-content/uploads/2024/12/Genshin-Impact-Bendicion-Lunar-600x833.webp	aprobada	2026-10-05 14:48:57.067948	109.00
1	2	Audífonos Sony WH-CH520	Batería para varios días. Con hasta 50 horas de duración de batería, puedes escuchar tu música favorita sin preocuparte por quedarte sin carga. Y si la batería de los audífonos se agota, una carga rápida de 3 minutos puede darte 1,5 horas de tiempo de escucha.	https://www.elpalaciodehierro.com/on/demandware.static/-/Sites-palacio-master-catalog/default/dw2e24fb4e/images/43282252/large/43282252_x1.jpg	aprobada	2026-09-26 23:00:51.184034	650.00
3	2	Disco de vinilo 1989 de Taylor Swift	Vinilo del álbum 1989 de Taylor Swift.\nTracklist:\n1. Welcome To New York\n2. Blank Space\n3. Style\n4. Out Of The Woods\n5. All You Had To Do Was Stay\n6. Shake It Off\n7. I Wish You Would\n8. Bad Blood\n9. Wildest Dreams\n10. How You Get The Girl\n11. This Love\n12. I Know Places\n13. Clean	https://down-my.img.susercontent.com/file/my-11134207-7r98v-lndpf865f4jg38	aprobada	2026-10-09 12:25:26.366978	600.00
\.


--
-- Data for Name: solicitudes_vendedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_vendedor (id, usuario_id, estado, fecha) FROM stdin;
1	2	aprobada	2026-09-26 22:18:08.115557
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password_hash, rol) FROM stdin;
1	Josmar Fernández	josmarfernandez@admin.com	$2b$10$QOrhxZ55F4FpIMcz93T0H.POsBw9vsz0MdZl1d2Rtu6mz1ArJq9Ou	admin
3	Edwin Sánchez	edwinsanchez@cliente.com	$2b$10$7jbxRogn1OAVWFG1Ab6fE.3QSYNYHD9vGys2e3GN5//Iy6kgh0voa	cliente
2	Carlos Gómez	carlosgomez@vendedor.com	$2b$10$Z9xdpnn029Q.jZyeH7X0EO4Bg1lseZ64jMZLTAdAxVvgVesSL52OO	vendedor
5	Josmar Fernández	jaipamen756@gmail.com	$2b$10$mg.LgG7DnfT/POHedALyXOWUrQU7fKkguoKExgsKttAsFxh8UwyyK	cliente
\.


--
-- Name: pedido_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_items_id_seq', 6, true);


--
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 4, true);


--
-- Name: publicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publicaciones_id_seq', 3, true);


--
-- Name: solicitudes_vendedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_vendedor_id_seq', 1, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 5, true);


--
-- Name: pedido_items pedido_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pkey PRIMARY KEY (id);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- Name: publicaciones publicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_vendedor solicitudes_vendedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_vendedor
    ADD CONSTRAINT solicitudes_vendedor_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_pedido_items_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedido_items_pedido ON public.pedido_items USING btree (pedido_id);


--
-- Name: idx_pedidos_cliente_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_cliente_fecha ON public.pedidos USING btree (cliente_id, fecha DESC);


--
-- Name: publicaciones fk_publicacion_vendedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT fk_publicacion_vendedor FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: solicitudes_vendedor fk_solicitud_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_vendedor
    ADD CONSTRAINT fk_solicitud_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_publicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id) ON DELETE SET NULL;


--
-- Name: pedidos pedidos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict HrnwMqrdctoTsnbytyRYWqfRaGNrZeIccrj6f8xtRTspaRQeRugK5Fw8lH9D2cR

