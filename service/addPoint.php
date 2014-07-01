<?php
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

if (!$dom->schemaValidate('schemes/addPoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');

$channel_name_element = $dom->getElementsByTagName('channel');
$category_id_element = $dom->getElementsByTagName('category_id');
$category_id_defined = $category_id_element->length > 0;

$title_element = $dom->getElementsByTagName('title');
$description_element = $dom->getElementsByTagName('description');
$link_element = $dom->getElementsByTagName('link');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$altitude_element = $dom->getElementsByTagName('altitude');
$time_element = $dom->getElementsByTagName('time');

$auth_token = $auth_token_element->item(0)->nodeValue;

$channel_name = null;
if (!$category_id_defined) {
    $channel_name = $channel_name_element->item(0)->nodeValue;
} else {
    $xmlrpc_request = xmlrpc_encode_request('getCategoryChannel',
            array('gets_token' => $auth_token,
                'category_id' => $category_id_element->item(0)->nodeValue));
    $xmlrpc_response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $xmlrpc_request, 'Content-Type: text/xml');
    $xmlrpc = xmlrpc_decode($xmlrpc_response);

    if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
        send_error(1, 'Error: internal error: can\'t retrieve private channel name');
        die();
    }

    $channel_name = $xmlrpc;
}

$data_array = array();
$data_array['channel'] = $channel_name;
$data_array['title'] = $title_element->item(0)->nodeValue;
$data_array['description'] = $description_element->item(0)->nodeValue;
$data_array['link'] = $link_element->item(0)->nodeValue;
$data_array['latitude'] = /*(float)*/ $latitude_element->item(0)->nodeValue;
$data_array['longitude'] = /*(float)*/ $longitude_element->item(0)->nodeValue;
$data_array['altitude'] = /*(float)*/ $altitude_element->item(0)->nodeValue;
$data_array['time'] = $time_element->item(0)->nodeValue;

try {
    $response_array = process_json_request(WRITE_TAG_METHOD_URL, $data_array, $auth_token);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

send_result(0, 'success', '');
?>

