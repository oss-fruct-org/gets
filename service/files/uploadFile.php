<?php

//require_once 'client.php';

//$root = check_content_directory($service);

/*
if ($method === 'GET') {
    $files = list_files($service, $root);

    foreach ($files as $file) {
        echo $file['title'] . " : " . $file['downloadUrl'] . "\n";
    }
} else if ($method === 'POST') {
    $mimeType = $_SERVER['CONTENT_TYPE'];
    $tmp = tempnam('/tmp', 'gets_store_content_');

    $title = $_GET['title'];

    file_put_contents($tmp, file_get_contents('php://input'));
    upload_file($service, $title, $mimeType, $root, $tmp);
    unlink($tmp);
}
*/
include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/public_token.inc');

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

if (!$dom->schemaValidate('schemes/uploadFile.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$title = get_request_argument($dom, 'title');

session_start();
$sess_id = session_id();

$post_url = UPLOAD_URL . '?id=' . $sess_id;
$response = '<post_url>' . htmlspecialchars($post_url) . '</post_url>';

$_SESSION['auth_token'] = $auth_token;
$_SESSION['title'] = $title;

send_result(0, 'success', $response);

?>
