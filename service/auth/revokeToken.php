<?php

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/config.inc');
include_once('../include/access_control.inc');

header('Content-Type:text/xml');

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

if (!$dom->schemaValidate('../schemes/authToken.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$gets_token = get_request_argument($dom, "auth_token", null);

try {
    auth_set_token($gets_token);
    auth_revoke();
    send_result(0, 'success', $content);
} catch (Exception $e) {
    send_error(1, "Can't revoke token");
}
