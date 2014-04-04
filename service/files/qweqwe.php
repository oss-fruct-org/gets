<?php

require_once 'client.php';

$root = check_content_directory($service);

$files = list_files($service, $root);

foreach ($files as $file) {
    echo $file['title'] . " : " . $file['downloadUrl'];
}

//$par = Array();
//$par['q'] = '\'0B99FJDhx6L84WWdGM2FxTnRDVUE\' in parents';
//var_dump(json_encode($files->listFiles()));

/*$file = new Google_DriveFile();

  $mimeType = 'application/vnd.google-apps.folder';

  $file->setTitle('audioguide-content');
  $file->setDescription('User content for AudioGuide application');
  $file->setMimeType($mimeType);

  $createdFile = $service->files->insert($file, array(
              'mimeType' => $mimeType));
              */


?>
