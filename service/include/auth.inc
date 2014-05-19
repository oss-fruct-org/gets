<?php

DEFINE('SESSION_SALT', 'wHDYKw2Rk2');

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

require_once 'config.inc';
require_once 'utils.inc';
require_once 'methods_url.inc';

function auth_create_client() {
    require_once 'GoogleClientAPI/src/Google_Client.php';
    $client = new Google_Client();
    $client->setAccessType('offline');
    $client->setUseObjects(true);

    // Deploy settings from config.inc
    $client->setApplicationName(GOOGLE_APP_NAME);
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_SECRET_ID);

    $client->setScopes(array('https://www.googleapis.com/auth/plus.me',
                'https://www.googleapis.com/auth/plus.login',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/userinfo.email'));

    return $client;
}

function auth_set_initial_token($access_token, $email) {
    $token_array = json_decode($access_token, true);

    if (!isset($token_array['refresh_token'])) {
        throw new GetsAuthException('Google access_token doesn\'t contain refresh_token element');
    }

    $refresh_token = $token_array['refresh_token'];
    
    auth_set_token($refresh_token);
    $_SESSION['access_token'] = $access_token;
    $_SESSION['email'] = $email;

    return $refresh_token;
}

function auth_set_token($gets_token) {
    session_id(sha1(SESSION_SALT . $gets_token));
    session_start();
    $_SESSION['gets_token'] = $gets_token;
}

function auth_get_google_token() {
    if (!isset($_SESSION['access_token'])) {
        auth_refresh_google_access();
    }

    return $_SESSION['access_token'];
}

function auth_get_google_email() {
    if (!isset($_SESSION['email'])) {
        auth_refresh_google_access();
    }

    return $_SESSION['email'];
}

function auth_get_geo2tag_token() {
    if (!isset($_SESSION['geo2tag_token'])) {
        auth_refresh_geo2tag_access();
    }

    return $_SESSION['geo2tag_token'];
}

function auth_refresh_geo2tag_access() {
    if (!isset($_SESSION['gets_token'])) {
        throw new GetsAuthException('gets_token not set');
    }
    $gets_token = $_SESSION['gets_token'];
    session_commit();

    $data = "<methodCall><methodName>checkUser</methodName>"
        . "<params><param><struct><member><name>gets_token</name><value>{$gets_token}</value></member></struct></param></params></methodCall>";
    $response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $data, 'Content-Type: text/xml');

    $dom_response = new DOMDocument();
    $dom_response->loadXML($response);

    $login = null;
    $password = null;

    $members_element = $dom_response->getElementsByTagName('member');
    foreach ($members_element as $member) {
        $name = $member->getElementsByTagName('name')->item(0)->nodeValue;
        if ($name === 'login') {
            $login = $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
        } else if ($name === 'password') {
            $password = $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
        }
    }

    if (!$login && !$password) {
        throw new GetsAuthException('Can\'t check account in geo2tag');
    }

    $login_array = array('login' => $login, 'password' => $password);
    $login_request = json_encode($login_array);

    $response_json = process_request(LOGIN_METHOD_URL, $login_request, 'Content-Type:application/json');
    $response_array = json_decode($response_json, true);

    if (!$response_array || $response_array['errno'] !== SUCCESS) {
        throw new GetsAuthException('Can\'t login in geo2tag');
    }

    $geo2tag_token = $response_array['auth_token'];
    $_SESSION['geo2tag_token'] = $geo2tag_token;
}

function auth_refresh_google_access() {
    require_once 'GoogleClientAPI/src/contrib/Google_PlusService.php';
    $gets_token = $_SESSION['gets_token'];

    $client = auth_create_client();

    try {
        $client->refreshToken($gets_token);
    } catch (Google_AuthException $e) {
        session_unset();
        session_destroy();
        throw new GetsAuthException('Can\'t refresh google token');
    }

    $service = new Google_PlusService($client);
    $person = $service->people->get('me');

    $email = $person->emails[0]['value'];
    $access_token = $client->getAccessToken();

    $_SESSION['email'] = $email;
    $_SESSION['access_token'] = $access_token;
}

class GetsAuthException extends Exception { }

?>
