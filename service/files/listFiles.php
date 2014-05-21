<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/public_token.inc');
include_once('../include/auth.inc');
require_once 'client.php';

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

if (!$dom->schemaValidate('schemes/listFiles.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');

try {
    auth_set_token($auth_token);
    auth_get_google_token();
} catch (GetsAuthException $e) {
    send_error(1, $e->getMessage());
    die();
}

try {
    $service = create_service();
    $root = check_content_directory($service);
    $files = list_files($service, $root);
} catch (Exception $e) {
    send_error(1, 'Error request to Google Drive');
    die();
}

$resp = '<files>';
foreach ($files as $file) {
    $resp .= '<file>';

    $resp .= '<title>' . htmlspecialchars($file['title']) . '</title>';
    $resp .= '<mimeType>' . htmlspecialchars($file['mime']) . '</mimeType>';
    $resp .= '<downloadUrl>' . htmlspecialchars($file['downloadUrl']) . '</downloadUrl>';

    $resp .= '</file>';
}

$resp .= '</files>';

send_result(0, 'success', $resp);

?>
