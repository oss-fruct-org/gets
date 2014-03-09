<?php
ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

include_once('include/methods_url.inc');
include_once('include/utils.inc');

header('Content-Type:text/xml');

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
        die();
    } else {
        require_once(dirname(__FILE__) . '/include/GoogleAuth.php');
        $xml = '<id>' . $session_id . '</id>'; 
        if ($client) {
            $client->setState($session_id);
            $xml .= '<redirect_url>' . htmlspecialchars($client->createAuthUrl()) . '</redirect_url>';
        } else {
            send_error(1, 'Error: internal server error');
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

if (isset($_SESSION['email'])) {
    $data = '<methodCall><methodName>checkUser</methodName><params><param><struct><member><name>email</name><value>' . 
            $_SESSION['email'] . 
            '</value></member></struct></param></params></methodCall>';
} else {
    send_error(1, 'Error: google authorization didn\'t go through or google email isn\'t available');
    session_unset();
    session_destroy();
    die();
}

session_unset();
session_destroy();

//!ATTENTION!
$response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $data, 'Content-Type: text/xml');
//$response =  process_request('http://kappa.cs.karelia.ru/~davydovs/retr/checkUser.php', $data, 'Content-Type: text/xml');
if (!$response) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$dom_response = new DOMDocument();
$dom_response->loadXML($response);

$data_array = array();

$members_element = $dom_response->getElementsByTagName('member');
foreach ($members_element as $member) {
    $name = $member->getElementsByTagName('name')->item(0)->nodeValue;
    if ($name === 'login') {
        $data_array['login'] = $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
    } elseif ($name === 'password') {
        $data_array['password'] = $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
    }
}

$data_json = json_encode($data_array);
if (!$data_json) {
    send_error(1, 'Error: can\'t convert data to json.');
    die();
}
//!ATTENTION!
$response_json =  process_request(LOGIN_METHOD_URL, $data_json, 'Content-Type:application/json');
//$response_json =  process_request('http://kappa.cs.karelia.ru/~davydovs/retr/login.php', $data_json, 'Content-Type:application/json');
if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

$response_code = check_errors($response_array['errno']);
if ($response_code != 'Ok') {
    send_error(1, $response_code);
    die();
}

$content = '<auth_token>' . $response_array['auth_token'] . '</auth_token>';
send_result(0, 'success', $content);
?>