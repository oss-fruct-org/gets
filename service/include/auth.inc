<?php

DEFINE('SESSION_SALT', 'wHDYKw2Rk2');

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

require_once 'GoogleClientAPI/src/Google_Client.php';
require_once 'GoogleClientAPI/src/contrib/Google_PlusService.php';
require_once 'config.inc';
require_once 'utils.inc';
require_once 'methods_url.inc';

function auth_create_client() {
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

/*
    Function creates new php session initialized with given initial access token
 */
function set_initial_access_token($access_token) {
    $token_array = json_decode($access_token, true);
    $refresh_token = $token_array['refresh_token'];

    session_id($refresh_token);
    session_start();
}

function auth_set_token($gets_token) {
    session_id(sha1(SESSION_SALT . $gets_token));
    session_start();
    $_SESSION['gets_token'] = $gets_token;
}

function auth_get_google_token() {
    if (!isset($_SESSION['access_token'])) {
        auth_refresh_google_token();
    }

    return $_SESSION['access_token'];
}

function auth_get_geo2tag_token() {
    if (!isset($_SESSION['geo2tag_token'])) {
        auth_refresh_geo2tag_access();
    }

    return $_SESSION['geo2tag_token'];
}

function auth_refresh_geo2tag_access() {
    if (!isset($_SESSION['email'])) {
        auth_refresh_google_access();
    }
    $email = $_SESSION['email'];

    $data = "<methodCall><methodName>checkUser</methodName>"
        . "<params><param><struct><member><name>email</name><value>{$email}</value></member></struct></param></params></methodCall>";
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
        throw new Exception('Can\'t check account in geo2tag');
    }

    $login_array = array('login' => $login, 'password' => $password);
    $login_request = json_encode($login_array);

    $response_json = process_request(LOGIN_METHOD_URL, $login_request, 'Content-Type:application/json');
    $response_array = json_decode($response_json, true);

    if (!$response_array || $response_array['errno'] !== SUCCESS) {
        throw new Exception('Can\'t login in geo2tag');
    }

    $geo2tag_token = $response_array['auth_token'];
    $_SESSION['geo2tag_token'] = $geo2tag_token;
}

function auth_refresh_google_access() {
    $gets_token = $_SESSION['gets_token'];

    $client = auth_create_client();
    $client->refreshToken($gets_token);

    $service = new Google_PlusService($client);
    $person = $service->people->get('me');

    $email = $person->emails[0]['value'];
    $access_token = $client->getAccessToken();

    $_SESSION['email'] = $email;
    $_SESSION['access_token'] = $access_token;
}

?>
