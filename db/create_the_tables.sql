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
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: gets_geo_distance(double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION gets_geo_distance(double precision, double precision, double precision, double precision) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
DECLARE
    lat1 ALIAS FOR $1;
    lon1 ALIAS FOR $2;
    lat2 ALIAS FOR $3;
    lon2 ALIAS FOR $4;

    theta double precision;
    dist double precision;
BEGIN
    theta := lon1 - lon2;
    dist := sin(radians(lat1)) * sin(radians(lat2)) + cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(theta));
    dist := acos(dist);
    dist := degrees(dist);
    dist := dist * 60 * 1.1515;
    dist := dist * 1.609344;
    return dist;
END;
$_$;


--
-- Name: json_object_set_key(json, text, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION json_object_set_key(json json, key_to_set text, value_to_set anyelement) RETURNS json
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT COALESCE(
  (SELECT ('{' || string_agg(to_json("key") || ':' || "value", ',') || '}')
     FROM (SELECT *
             FROM json_each("json")
            WHERE "key" <> "key_to_set"
            UNION ALL
           SELECT "key_to_set", to_json("value_to_set")) AS "fields"),
  '{}'
)::json
$$;


--
-- Name: safe_cast_to_json(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION safe_cast_to_json(text) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
begin
    if $1 is null or substring($1, 0, 2) != '{' then
        return '{}'::json;
    end if;

    return cast($1 as json);
exception
    when invalid_text_representation then
        return '{}'::json;
end;
$_$;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: adminUsers; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE "adminUsers" (
    admin_id numeric(9,0) NOT NULL,
    owner_id numeric(9,0) NOT NULL
);


--
-- Name: TABLE "adminUsers"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "adminUsers" IS 'contains list of admins for geTS service';


--
-- Name: COLUMN "adminUsers".admin_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "adminUsers".admin_id IS 'GeTS admin id';


--
-- Name: COLUMN "adminUsers".owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "adminUsers".owner_id IS 'GeTS service core admin id';


--
-- Name: category_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE category_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: category; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE category (
    id numeric(9,0) DEFAULT nextval('category_seq'::regclass) NOT NULL,
    name character varying(300) NOT NULL,
    description character varying(2048) DEFAULT NULL::character varying,
    url character varying(2048) DEFAULT NULL::character varying,
    owner_id numeric(9,0)
);


--
-- Name: channels_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE channels_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: channel; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE channel (
    id numeric(9,0) DEFAULT nextval('channels_seq'::regclass) NOT NULL,
    name character varying(300) NOT NULL,
    description character varying(20480) NOT NULL,
    url character varying(2048) DEFAULT NULL::character varying,
    owner_id numeric(9,0) NOT NULL
);


--
-- Name: rating; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE rating (
    tag_id numeric(9,0) NOT NULL,
    ratingsum integer NOT NULL
);


--
-- Name: TABLE rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE rating IS 'Calculates user votes';


--
-- Name: sessions_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sessions_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE sessions (
    id numeric(9,0) DEFAULT nextval('sessions_seq'::regclass) NOT NULL,
    user_id numeric(9,0) NOT NULL,
    session_token character varying(65) NOT NULL,
    last_access_time timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: share; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE share (
    id integer NOT NULL,
    channel_id integer NOT NULL,
    key text NOT NULL,
    remain integer NOT NULL
);


--
-- Name: share_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE share_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: share_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE share_id_seq OWNED BY share.id;


--
-- Name: signup_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE signup_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: signups; Type: TABLE; Schema: public; Owner: -; Tablespace: 
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


--
-- Name: subscribe; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE subscribe (
    channel_id numeric(9,0) NOT NULL,
    user_id numeric(9,0) NOT NULL,
    share_id integer
);


--
-- Name: tags_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tags_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE tag (
    id numeric(9,0) DEFAULT nextval('tags_seq'::regclass) NOT NULL,
    "time" timestamp without time zone DEFAULT now() NOT NULL,
    altitude double precision NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    label character varying(1024) NOT NULL,
    description character varying(20480) NOT NULL,
    url character varying(2048) DEFAULT NULL::character varying,
    user_id numeric(9,0) DEFAULT 1 NOT NULL,
    channel_id numeric(9,0) DEFAULT 1 NOT NULL
);


--
-- Name: trustedUser_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "trustedUser_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trustedUsers; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE "trustedUsers" (
    user_id numeric(9,0) NOT NULL,
    owner_id numeric(9,0) NOT NULL
);


--
-- Name: TABLE "trustedUsers"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "trustedUsers" IS 'contains trusted users for GTS service';


--
-- Name: COLUMN "trustedUsers".owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "trustedUsers".owner_id IS 'core admin''s ID';


--
-- Name: users_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE users (
    id numeric(9,0) DEFAULT nextval('users_seq'::regclass) NOT NULL,
    email character varying(50) NOT NULL,
    login character varying(50) NOT NULL,
    password character varying(50) NOT NULL
);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY share ALTER COLUMN id SET DEFAULT nextval('share_id_seq'::regclass);


--
-- Name: adminusers_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY "adminUsers"
    ADD CONSTRAINT adminusers_key PRIMARY KEY (admin_id, owner_id);


--
-- Name: category_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY channel
    ADD CONSTRAINT channel_pkey PRIMARY KEY (id);


--
-- Name: rating_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY rating
    ADD CONSTRAINT rating_key PRIMARY KEY (tag_id);


--
-- Name: sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: share_key_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY share
    ADD CONSTRAINT share_key_key UNIQUE (key);


--
-- Name: share_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY share
    ADD CONSTRAINT share_pkey PRIMARY KEY (id);


--
-- Name: signup_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signup_requests_pkey PRIMARY KEY (id);


--
-- Name: signups_email_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signups_email_key UNIQUE (email);


--
-- Name: signups_login_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signups_login_key UNIQUE (login);


--
-- Name: signups_registration_token_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY signups
    ADD CONSTRAINT signups_registration_token_key UNIQUE (registration_token);


--
-- Name: subscribe_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT subscribe_pkey PRIMARY KEY (channel_id, user_id);


--
-- Name: tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: trusted_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY "trustedUsers"
    ADD CONSTRAINT trusted_key PRIMARY KEY (user_id, owner_id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_login_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: tag_idx_channel_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX tag_idx_channel_id ON tag USING btree (channel_id);


--
-- Name: tag_idx_user_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX tag_idx_user_id ON tag USING btree (user_id);


--
-- Name: admin_key; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "adminUsers"
    ADD CONSTRAINT admin_key FOREIGN KEY (admin_id) REFERENCES users(id);


--
-- Name: fk_channel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT fk_channel FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE;


--
-- Name: fk_channels; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT fk_channels FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE;


--
-- Name: fk_owner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY channel
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_tags; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT fk_tags FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: owner_key; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY category
    ADD CONSTRAINT owner_key FOREIGN KEY (owner_id) REFERENCES users(id);


--
-- Name: owner_key; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "adminUsers"
    ADD CONSTRAINT owner_key FOREIGN KEY (owner_id) REFERENCES users(id);


--
-- Name: owner_key; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "trustedUsers"
    ADD CONSTRAINT owner_key FOREIGN KEY (owner_id) REFERENCES users(id);


--
-- Name: share_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY share
    ADD CONSTRAINT share_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE;


--
-- Name: subscribe_share_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY subscribe
    ADD CONSTRAINT subscribe_share_id_fkey FOREIGN KEY (share_id) REFERENCES share(id) ON DELETE CASCADE;


--
-- Name: tag_key; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY rating
    ADD CONSTRAINT tag_key FOREIGN KEY (tag_id) REFERENCES tag(id);


--
-- Name: user_key; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "trustedUsers"
    ADD CONSTRAINT user_key FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

