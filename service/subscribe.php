<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');

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

if (!$dom->schemaValidate('schemes/subscribe.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$channel_name_element = $dom->getElementsByTagName('channel');

$data_array = array();
$data_array['channel'] = $channel_name_element->item(0)->nodeValue;

try {
    $response_array =  process_json_request(SUBSCRIBE_METHOD_URL, $data_array, $auth_token_element->item(0)->nodeValue);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

send_result(0, 'success', '');
?>
