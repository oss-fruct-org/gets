<?php
require_once 'GoogleClientAPI/src/Google_Client.php';
require_once 'GoogleClientAPI/src/contrib/Google_PlusService.php';
require_once 'config.php';

//http://oss.fruct.org/projects/gets/service/include/GoogleAuth.php
$redirectUri = 'http://' . $_SERVER['HTTP_HOST'] . '/projects/gets/service/include/GoogleAuth.php';
//$redirectUri = 'http://' . $_SERVER['HTTP_HOST'] . '/service/include/GoogleAuth.php';

$client = new Google_Client();
$client->setAccessType('online');

// Deploy settings
$client->setApplicationName('GeTS-Service');
$client->setClientId('710658254828-tntn2h772v22ilii1qgsvlfgrijrbg6e.apps.googleusercontent.com');
$client->setClientSecret('y8fwnTyiEs-gsrCTLtfFyjXn');

// Test settings
/*$client->setApplicationName('GeTS-Service');
$client->setClientId('710658254828-685kmam6s7pu65o82ihmdgfq69eu4bi0.apps.googleusercontent.com');
$client->setClientSecret('S76cHyp2pUQfrltron0Abu7e');*/

$client->setRedirectUri($redirectUri);
$client->setScopes(array('https://www.googleapis.com/auth/plus.me', 
                        'https://www.googleapis.com/auth/plus.login', 
                        'https://www.googleapis.com/auth/userinfo.email'));
//$client->setUseObjects(true);
//$client->setDeveloperKey('AIzaSyBar90-XlZwVwZmrpH7b47weLrVhO4qQKI'); // API key


// $service implements the client interface, has to be set before auth call
$service = new Google_PlusService($client);

if (isset($_GET['code']) && isset($_GET['state'])) { // we received the positive auth callback, get the token and store it in session
    $client->authenticate();
    session_id($_GET['state']);
    session_start();
    $person = $service->people->get('me');
    $_SESSION['email'] = $person['emails'][0]['value'];
    echo '<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                </head>
                <body>
                    Login success.<br>
                    This page will be closed in <span id="count"></span> seconds...
                    <script>
                        var counter = 2;
                        setInterval(function() {
                            document.getElementById("count").innerHTML = counter--;
                        }, 1000 );
                        setTimeout(function() {
                            self.close();
                        }, 3000 ); // after 3 seconds
                    </script>
                </body>
             </html>';
}
?>