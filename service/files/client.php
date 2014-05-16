<?php

require_once '../include/GoogleClientAPI/src/Google_Client.php';
require_once '../include/GoogleClientAPI/src/contrib/Google_DriveService.php';
require_once '../include/config.inc';
require_once '../include/utils.inc';

$client = new Google_Client();
$client->setAccessType('online');
$client->setUseObjects(true);

// Deploy settings from config.inc
$client->setApplicationName(GOOGLE_APP_NAME);
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_SECRET_ID);

$client->setScopes(array('https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email'));

//session_id("ec0fccd957e5b65d5460ca147d2b4ccc");
//session_start();

$client->setAccessToken($_SESSION["access_token"]);

$service = new Google_DriveService($client);
$files = $service->files;
$permissions = $service->permissions;


define('CONTENT_DIRECTORY', 'gets-content-directory');
define('FOLDER_MIME', 'application/vnd.google-apps.folder');

function create_content_directory($service) {
    $files = $service->files;
    $permissions = $service->permissions;

    $file = new Google_DriveFile();
    $file->setTitle(CONTENT_DIRECTORY);
    $file->setMimeType(FOLDER_MIME);
    $file->setDescription('User content for GeTS service');
    $created_file = $service->files->insert($file, array('mimeType' => FOLDER_MIME));

    $id = $created_file->id;

    // File created now install public permission
    $perm = new Google_Permission();
    $perm->setType('anyone');
    $perm->setRole('reader');
    $permissions->insert($id, $perm);

    return $id;
}

function check_content_directory($service) {
    $files = $service->files;

    $list = $files->listFiles(Array('q' => 'trashed = false and title = \'' . CONTENT_DIRECTORY . '\''));

    // No GeTS content directory created yet
    if (count($list->items) === 0) {
        return create_content_directory($service);
    }
    return $list->items[0]->id;
}

function upload_file($service, $title, $mime, $parent_id, $file_path) {
    $file = new Google_DriveFile();
    $file->setTitle($title);
    $file->setMimeType($mime);
    
    if ($parent_id != null) {
        $parent = new Google_ParentReference();
        $parent->setId($parent_id);
        $file->setParents(array($parent));
    }

    $data = file_get_contents($file_path);

    $created_file = $service->files->insert($file, array(
                'data' => $data,
                'mimeType' => $mime,
                ));

    return $created_file;
}

function list_files($service, $parent_id) {
    $files = $service->files;
    $list = $files->listFiles(Array('q' => 'trashed = false and \'' . $parent_id . '\' in parents'));

    $ret = Array();

    $count = count($list->items);
    for ($i = 0; $i < $count; $i++) {
        $file = $list->items[$i];

        $file_arr = Array('title' => $file->title,
                'mime' => $file->mimeType,
                'downloadUrl' => $file->webContentLink);
        $ret[$i] = $file_arr;

    }

    return $ret;
}

?>
