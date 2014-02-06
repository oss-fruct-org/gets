<?php
ini_set('display_errors',1);
error_reporting(E_ALL);

require_once dirname(__FILE__) . '/GoogleClientAPI/src/Google_Client.php';
require_once dirname(__FILE__) . '/GoogleClientAPI/src/contrib/Google_PlusService.php';

//$scriptUri = "http://".$_SERVER["HTTP_HOST"].$_SERVER['PHP_SELF'];
$redirectUri = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];


$client = new Google_Client();
$client->setAccessType('online'); // default: offline
$client->setApplicationName('GeTS-Service');
$client->setClientId('710658254828-tntn2h772v22ilii1qgsvlfgrijrbg6e.apps.googleusercontent.com');
$client->setClientSecret('y8fwnTyiEs-gsrCTLtfFyjXn');
$client->setRedirectUri($redirectUri);
//$client->setUseObjects(true);
//$client->setDeveloperKey('AIzaSyBar90-XlZwVwZmrpH7b47weLrVhO4qQKI'); // API key
$client->setScopes(array('https://www.googleapis.com/auth/plus.me', 
                        'https://www.googleapis.com/auth/plus.login', 
                        'https://www.googleapis.com/auth/userinfo.email', 
                        'https://www.googleapis.com/auth/userinfo.profile'));

// $service implements the client interface, has to be set before auth call
$service = new Google_PlusService($client);

if (isset($_GET['logout'])) { // logout: destroy token
    unset($_SESSION['token']);
    header('Location: ' . $redirectUri);
}

if (isset($_SESSION['token'])) { // extract token from session and configure client
    $token = $_SESSION['token'];
    $client->setAccessToken($token);
}

if (isset($_GET['code'])) { // we received the positive auth callback, get the token and store it in session
    $client->authenticate();
    $_SESSION['token'] = $client->getAccessToken();
    $person = $service->people->get('me');
    //echo "Token : " . $client->getAccessToken();
    //var_dump($person);
    echo '<p>Display name: ' . $person['displayName'] . '</p>';
    echo '<p>Email: ' . $person['emails'][0]['value'] . '</p>';
    echo '<p>Id: ' . $person['id'] . '</p>';
    echo '<p>Token: ' . json_decode($_SESSION['token'], true)['access_token'] . '</p>';
    echo '<form action="' . $redirectUri . '?logout=1"><input type="submit" value="Logout"></form>';
}


if (!$client->getAccessToken()) { // auth call to google
    $authUrl = $client->createAuthUrl();
    header('Location: ' . $authUrl);
    die;
}
?>