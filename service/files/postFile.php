<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
require_once 'client.php';

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

try {
    auth_set_token($auth_token);
    auth_get_google_token();
} catch (GetsAuthException $e) {
    send_error(1, $e->getMessage());
    die();
}

$mimeType = $_SERVER['CONTENT_TYPE'];
$tmp = tempnam('/tmp', 'gets_store_content_');

file_put_contents($tmp, file_get_contents('php://input'));

try {
    $service = create_service();
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
