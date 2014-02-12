--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: category_seq; Type: SEQUENCE; Schema: public; Owner: geo2tag
--

CREATE SEQUENCE category_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_seq OWNER TO geo2tag;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: category; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE category (
    id numeric(9,0) DEFAULT nextval('category_seq'::regclass) NOT NULL,
    name character varying(300) NOT NULL,
    description character varying(2048) NOT NULL,
    url character varying(2048) DEFAULT NULL::character varying
);


ALTER TABLE public.category OWNER TO geo2tag;

--
-- Name: channels_seq; Type: SEQUENCE; Schema: public; Owner: geo2tag
--

CREATE SEQUENCE channels_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.channels_seq OWNER TO geo2tag;

--
-- Name: channel; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE channel (
    id numeric(9,0) DEFAULT nextval('channels_seq'::regclass) NOT NULL,
    name character varying(300) NOT NULL,
    description character varying(2048) NOT NULL,
    url character varying(2048) DEFAULT NULL::character varying,
    owner_id numeric(9,0) NOT NULL
);


ALTER TABLE public.channel OWNER TO geo2tag;

--
-- Name: reset_password_tokens; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE reset_password_tokens (
    user_id numeric(9,0) NOT NULL,
    token character varying(65) NOT NULL,
    datetime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reset_password_tokens OWNER TO geo2tag;

--
-- Name: sessions_seq; Type: SEQUENCE; Schema: public; Owner: geo2tag
--

CREATE SEQUENCE sessions_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_seq OWNER TO geo2tag;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE sessions (
    id numeric(9,0) DEFAULT nextval('sessions_seq'::regclass) NOT NULL,
    user_id numeric(9,0) NOT NULL,
    session_token character varying(65) NOT NULL,
    last_access_time timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO geo2tag;

--
-- Name: signup_seq; Type: SEQUENCE; Schema: public; Owner: geo2tag
--

CREATE SEQUENCE signup_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.signup_seq OWNER TO geo2tag;

--
-- Name: signups; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE signups (
    id numeric(9,0) DEFAULT nextval('signup_seq'::regclass) NOT NULL,
    datetime timestamp without time zone DEFAULT now() NOT NULL,
    email character varying(50) NOT NULL,
    login character varying(50) NOT NULL,
    password character varying(50) NOT NULL,
    registration_token character varying(65) NOT NULL,
    sent boolean DEFAULT false NOT NULL
);


ALTER TABLE public.signups OWNER TO geo2tag;

--
-- Name: subscribe; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE subscribe (
    channel_id numeric(9,0) NOT NULL,
    user_id numeric(9,0) NOT NULL
);


ALTER TABLE public.subscribe OWNER TO geo2tag;

--
-- Name: tags_seq; Type: SEQUENCE; Schema: public; Owner: geo2tag
--

CREATE SEQUENCE tags_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_seq OWNER TO geo2tag;

--
-- Name: tag; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE tag (
    id numeric(9,0) DEFAULT nextval('tags_seq'::regclass) NOT NULL,
    "time" timestamp without time zone DEFAULT now() NOT NULL,
    altitude double precision NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    label character varying(1024) NOT NULL,
    description character varying(2048) NOT NULL,
    url character varying(2048) DEFAULT NULL::character varying,
    user_id numeric(9,0) DEFAULT 1 NOT NULL,
    channel_id numeric(9,0) DEFAULT 1 NOT NULL
);


ALTER TABLE public.tag OWNER TO geo2tag;

--
-- Name: tmp_users; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE tmp_users (
    registration_token character varying(50) NOT NULL,
    db_name character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    login character varying(50) NOT NULL,
    password character varying(50) NOT NULL,
    datetime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tmp_users OWNER TO geo2tag;

--
-- Name: users_seq; Type: SEQUENCE; Schema: public; Owner: geo2tag
--

CREATE SEQUENCE users_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_seq OWNER TO geo2tag;

--
-- Name: users; Type: TABLE; Schema: public; Owner: geo2tag; Tablespace: 
--

CREATE TABLE users (
    id numeric(9,0) DEFAULT nextval('users_seq'::regclass) NOT NULL,
    email character varying(50) NOT NULL,
    login character varying(50) NOT NULL,
    password character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO geo2tag;

--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY category (id, name, description, url) FROM stdin;
\.


--
-- Name: category_seq; Type: SEQUENCE SET; Schema: public; Owner: geo2tag
--

SELECT pg_catalog.setval('category_seq', 1, false);


--
-- Data for Name: channel; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY channel (id, name, description, url, owner_id) FROM stdin;
16	tr_test	{"description":"Test track","categoryId":"1"}	http://example.com	7
17	tr_test2	{"description":"Test track 2","categoryId":"2"}	http://example.com	7
25	tr_private	{"description":"Private track","categoryId":"3"}	http://example.com	8
\.


--
-- Name: channels_seq; Type: SEQUENCE SET; Schema: public; Owner: geo2tag
--

SELECT pg_catalog.setval('channels_seq', 25, true);


--
-- Data for Name: reset_password_tokens; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY reset_password_tokens (user_id, token, datetime) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY sessions (id, user_id, session_token, last_access_time) FROM stdin;
\.


--
-- Name: sessions_seq; Type: SEQUENCE SET; Schema: public; Owner: geo2tag
--

SELECT pg_catalog.setval('sessions_seq', 2, true);


--
-- Name: signup_seq; Type: SEQUENCE SET; Schema: public; Owner: geo2tag
--

SELECT pg_catalog.setval('signup_seq', 4, true);


--
-- Data for Name: signups; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY signups (id, datetime, email, login, password, registration_token, sent) FROM stdin;
1	2014-02-10 14:33:05.177915	email1@test1.org	Alex	test	AAAAAAAAAA	f
2	2014-02-10 14:33:05.189027	email2@test2.org	Kate	test	KKKKKKKKKK	f
3	2014-02-10 14:33:05.20027	email3@test3.org	Mary	test	MMMMMMMMMM	f
4	2014-02-10 14:33:05.211292	email4@test4.org	David	test	DDDDDDDDDD	f
\.


--
-- Data for Name: subscribe; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY subscribe (channel_id, user_id) FROM stdin;
25	8
16	7
17	7
\.


--
-- Data for Name: tag; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY tag (id, "time", altitude, latitude, longitude, label, description, url, user_id, channel_id) FROM stdin;
47	2014-02-11 15:15:24.676433	0	61	34	qwe	asd	http://example.com	8	25
\.


--
-- Name: tags_seq; Type: SEQUENCE SET; Schema: public; Owner: geo2tag
--

SELECT pg_catalog.setval('tags_seq', 47, true);


--
-- Data for Name: tmp_users; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY tmp_users (registration_token, db_name, email, login, password, datetime) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: geo2tag
--

COPY users (id, email, login, password) FROM stdin;
7	gets_user@example.com	gets_user	gets_user_password
8	test_user@example.com	test_user	test_user_password
\.


--
-- Name: users_seq; Type: SEQUENCE SET; Schema: public; Owner: geo2tag
--

SELECT pg_catalog.setval('users_seq', 8, true);


--
-- Name: category_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: channel_name_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY channel
    ADD CONSTRAINT channel_name_key UNIQUE (name);


--
-- Name: channel_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY channel
    ADD CONSTRAINT channel_pkey PRIMARY KEY (id);


--
-- Name: reset_password_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY reset_password_tokens
    ADD CONSTRAINT reset_password_tokens_pkey PRIMARY KEY (token);


--
-- Name: sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: signup_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signup_requests_pkey PRIMARY KEY (id);


--
-- Name: signups_email_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signups_email_key UNIQUE (email);


--
-- Name: signups_login_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signups_login_key UNIQUE (login);


--
-- Name: signups_registration_token_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signups_registration_token_key UNIQUE (registration_token);


--
-- Name: subscribe_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT subscribe_pkey PRIMARY KEY (channel_id, user_id);


--
-- Name: tag_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: tmp_users_email_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY tmp_users
    ADD CONSTRAINT tmp_users_email_key UNIQUE (email);


--
-- Name: tmp_users_login_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY tmp_users
    ADD CONSTRAINT tmp_users_login_key UNIQUE (login);


--
-- Name: tmp_users_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY tmp_users
    ADD CONSTRAINT tmp_users_pkey PRIMARY KEY (registration_token);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_login_key; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: geo2tag; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: fk_channel; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT fk_channel FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE;


--
-- Name: fk_channels; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT fk_channels FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE;


--
-- Name: fk_owner; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY channel
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_tags; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT fk_tags FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_user; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY reset_password_tokens
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_user; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_user; Type: FK CONSTRAINT; Schema: public; Owner: geo2tag
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

