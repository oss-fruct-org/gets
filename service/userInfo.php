<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/auth.inc');

header ('Content-Type:text/xml');

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

if (!$dom->schemaValidate('schemes/userInfo.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
try {
    auth_set_token($auth_token);
    $email = auth_get_google_email();
    $escaped_email = htmlspecialchars($email);
} catch (GetsAuthException $e) {
    send_error(1, $e->getMessage());
    die();
}

$response = '<userInfo>';
$response .= "<email>{$escaped_email}</email>";
if (strcmp($email,GEO2TAG_EMAIL) == 0) {
    $response .= "<isCoreUser>true</isCoreUser>";
}
$response .= '</userInfo>';

send_result(0, 'success', $response);

?>
