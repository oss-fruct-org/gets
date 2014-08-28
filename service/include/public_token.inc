<?php

include_once('config.inc');
include_once('methods_url.inc');
include_once('geo2tag_errors_list.inc');
include_once('auth.inc');

function create_session_id() {
    return sha1('9EXyKVPgLthG' . GEO2TAG_USER . 'O1He7SYW7t3a' . GEO2TAG_PASSWORD);
}

function get_public_token() {
    $public_token = read_public_token();

    if (!$public_token) {
        $public_token = receive_public_token();
    } else {
        auth_set_token($public_token);
        if (!isset($_SESSION['login'])) {
            // Session expired
            session_unset();
            session_destroy();

            $public_token = receive_public_token();
        }
        session_commit();
    }

    return $public_token;
}

function read_public_token() {
    session_id(create_session_id());
    session_start();

    if (isset($_SESSION['public_token'])) {
        $ret = $_SESSION['public_token'];
    } else {
        $ret = false;
    }
    session_commit();
    return $ret;
}

function write_public_token($token) {
    session_id(create_session_id());
    session_start();
    $_SESSION['public_token'] = $token;
    session_commit();
}

function invalidate_public_token() {
    session_id(create_session_id());
    session_start();

    session_unset();
    session_destroy();
}

function receive_public_token() {
    $token = auth_set_initial_public_token(GEO2TAG_USER, GEO2TAG_PASSWORD, GEO2TAG_EMAIL);
    session_commit();

    write_public_token($token);

    return $token;
}

?>
