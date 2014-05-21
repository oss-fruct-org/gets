<?php
ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');

header('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
} else {
    header('Access-Control-Allow-Origin: *');
}

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

if (!$dom->schemaValidate('schemes/userLogin.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$id_element = $dom->getElementsByTagName('id');
$is_id_defined = $id_element->length > 0;

// response string
$xml = '';

if (!$is_id_defined) {
    session_start();
    $session_id = session_id();
    if (empty($session_id)) {
        send_error(1, 'Error: internal server error');
        session_destroy();
        die();
    } else {
        require_once(dirname(__FILE__) . '/include/GoogleAuth.php');
        $xml = '<id>' . $session_id . '</id>'; 
        if ($client) {
            $client->setState($session_id);
            $xml .= '<redirect_url>' . htmlspecialchars($client->createAuthUrl()) . '</redirect_url>';
        } else {
            send_error(1, 'Error: internal server error');
            session_destroy();
            die();
        }
        send_result(2, 'redirect', $xml);
        die();
    }
}

session_id($id_element->item(0)->nodeValue);
session_start();
if (session_id() === '') {
    send_error(1, 'Error: wrong id');
    die();
}

if (!isset($_SESSION['access_token'])) {
    send_error(1, 'Error: google authorization didn\'t go through or google email isn\'t available');
    session_unset();
    session_destroy();
    die();
}

$google_access_token = $_SESSION['access_token'];
$google_email = $_SESSION['email'];

session_unset();
session_destroy();

$auth_token = auth_set_initial_token($google_access_token, $google_email);
auth_refresh_geo2tag_access();

$content = '<auth_token>' . $auth_token . '</auth_token>';
send_result(0, 'success', $content);
?>
