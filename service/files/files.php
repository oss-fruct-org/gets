<?php

$method = $_SERVER['REQUEST_METHOD'];
$auth_token = $_GET['auth_token'];

session_id($auth_token);
session_start();

require_once 'client.php';

$root = check_content_directory($service);

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
?>
