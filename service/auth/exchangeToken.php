<?php

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/config.inc');
include_once('../include/access_control.inc');

header('Content-Type:text/xml');

require_once '../include/GoogleClientAPI/src/Google_Client.php';
require_once '../include/GoogleClientAPI/src/contrib/Google_PlusService.php';

$xml_post = file_get_contents('php://input');
if (!$xml_post) {
    send_error(1, 'Error: no input file');
    die();
}

libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadXML($xml_post);

if (!$dom) {
    send_error(1, 'Error: resource isn\'t XML document.');
    die();
}

if (!$dom->schemaValidate('../schemes/exchangeToken.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$exchange_token = get_request_argument($dom, "exchange_token", null);

$client = new Google_Client();
$client->setAccessType('offline');
$client->setApplicationName(GOOGLE_APP_NAME);
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_SECRET_ID);
$client->setScopes(array('https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email'));

$service = new Google_PlusService($client);
try {
    $client->authenticate($exchange_token);

    $person = $service->people->get('me');
    $google_email = $person['emails'][0]['value'];
    $google_access_token = $client->getAccessToken();

    $auth_token = auth_set_initial_token($google_access_token, $google_email);

    $content = '<auth_token>' . $auth_token . '</auth_token>';
    send_result(0, 'success', $content);
} catch (Exception $e) {
    error_log($e->getMessage());
    send_error(1, "Can't login in google");
}
