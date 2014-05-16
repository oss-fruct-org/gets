<?php

require_once '../include/GoogleClientAPI/src/Google_Client.php';
require_once '../include/GoogleClientAPI/src/contrib/Google_PlusService.php';
require_once '../include/config.inc';
require_once '../include/utils.inc';

$client = new Google_Client();
$client->setAccessType('offline');
$client->setUseObjects(true);

// Deploy settings from config.inc
$client->setApplicationName(GOOGLE_APP_NAME);
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_SECRET_ID);

$client->setScopes(array('https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email'));

$client->refreshToken(file_get_contents('php://input'));

$service = new Google_PlusService($client);
$person = $service->people->get('me');
$email = $person->emails[0]['value'];

echo $email;
?>
