<?php

include_once('config.inc');
include_once('methods_url.inc');
include_once('geo2tag_errors_list.inc');
include_once('auth.inc');

function create_session_id() {
    return sha1('9EXyKVPgLthG' . GEO2TAG_USER . 'O1He7SYW7t3a' . GEO2TAG_PASSWORD);
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
    $arr = array();
    $arr['login'] = GEO2TAG_USER;
    $arr['password'] = GEO2TAG_PASSWORD;

    $request_json = json_encode($arr);
    $response_json = process_request(LOGIN_METHOD_URL, $request_json, 'Content-Type:application/json');

    if (!$response_json) {
        send_error(1, 'Error: problem with request to geo2tag.');
        die();
    }

    $response = json_decode($response_json, true);
    if (!$response) {
        send_error(1, 'Error: can\'t decode data from geo2tag.');
        die();
    }

    $response_code = $response['errno'];

    if ($response_code === INCORRECT_CREDENTIALS_ERROR) {
        return false;
    }

    $token = auth_set_initial_public_token($response['auth_token'], GEO2TAG_EMAIL);
    session_commit();

    write_public_token($token);

    return $token;
}

?>
