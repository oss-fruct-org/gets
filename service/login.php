<?php
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

if (!$dom->schemaValidate('schemes/login.xsd')) {
	send_error(1, 'Error: not valid input XML document.');
    die();
}

$login_element = $dom->getElementsByTagName('login');
$password_element = $dom->getElementsByTagName('password');

$data_array = array();
$data_array['login'] = $login_element->item(0)->nodeValue;
$data_array['password'] = $password_element->item(0)->nodeValue;

$data_json = json_encode($data_array);
if (!$data_json) {
	send_error(1, 'Error: can\'t convert data to json.');
	die();
}

$response_json =  process_request(LOGIN_METHOD_URL, $data_json, 'Content-Type:application/json');
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
