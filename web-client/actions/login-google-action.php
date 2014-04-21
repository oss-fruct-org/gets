<?php
include_once('../google-api-php-client/src/Google_Client.php');

// Create a state token to prevent request forgery.
// Store it in the session for later validation.
$state = md5(rand());
$app['session']->set('state', $state);
// Set the client ID, token state, and application name in the HTML while
// serving it.
return $app['twig']->render('index.html', array(
    'CLIENT_ID' => 710658254828-tntn2h772v22ilii1qgsvlfgrijrbg6e.apps.googleusercontent.com,
    'STATE' => $state,
    'APPLICATION_NAME' => GeTS-Service 
));



?>
