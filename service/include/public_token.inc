<?php

include_once('config.inc');
include_once('methods_url.inc');
include_once('geo2tag_errors_list.inc');

function read_public_token() {
    $content = file_get_contents(PUBLIC_TOKEN_FILE);
    if (!$content)
        return false;
    else
        return unserialize($content);
}

function write_public_token($token) {
    $content = serialize($token);
    file_put_contents(PUBLIC_TOKEN_FILE, $content);
}

function invalidate_public_token() {
    unlink(PUBLIC_TOKEN_FILE);
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

    $token = $response['auth_token'];
    write_public_token($token);

    return $token;
}

?>
