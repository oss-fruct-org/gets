<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/public_token.inc');

$id = $_GET['id'];
if (!$id) {
    send_error(1, 'No id specified');
    die();
}

session_id($id);
session_start();

$auth_token = $_SESSION['auth_token'];
$title = $_SESSION['title'];

session_unset();
session_destroy();

if (!$auth_token) {
    send_error(1, 'Upload id has expired');
    die();
}

session_id($auth_token);
session_start();

$mimeType = $_SERVER['CONTENT_TYPE'];
$tmp = tempnam('/tmp', 'gets_store_content_');

file_put_contents($tmp, file_get_contents('php://input'));

try {
    require_once 'client.php';
    $root = check_content_directory($service);
    $file = upload_file($service, $title, $mimeType, $root, $tmp);
} catch (Exception $e) {
    send_error(1, 'Error request to Google Drive');
    unlink($tmp);
    die();
}

unlink($tmp);

$response = '<file>';

$response .= '<title>' . htmlspecialchars($file->title) . '</title>';
$response .= '<downloadUrl>' . htmlspecialchars($file->webContentLink) . '</downloadUrl>';
$response .= '<mimeType>' . htmlspecialchars($file->mimeType) . '</mimeType>';

$response .= '</file>';

send_result(0, 'success', $response);

?>
