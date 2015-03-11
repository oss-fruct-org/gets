<?php
ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/config.inc');

header('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
} else {
    header('Access-Control-Allow-Origin: *');
}

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

if (!$dom->schemaValidate('../schemes/empty.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$xml = "<client_id>" . htmlspecialchars(GOOGLE_CLIENT_ID) . "</client_id>";
$xml .= "<scope>https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email</scope>";

send_result(0, 'success', $xml);
