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

if (!$dom->schemaValidate('schemes/addPoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$channel_name_element = $dom->getElementsByTagName('channel');
$title_element = $dom->getElementsByTagName('title');
$description_element = $dom->getElementsByTagName('description');
$link_element = $dom->getElementsByTagName('link');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$altitude_element = $dom->getElementsByTagName('altitude');
$time_element = $dom->getElementsByTagName('time');

$data_array = array();
$data_array['auth_token'] = $auth_token_element->item(0)->nodeValue;
$data_array['channel'] = $channel_name_element->item(0)->nodeValue;
$data_array['title'] = $title_element->item(0)->nodeValue;
$data_array['description'] = $description_element->item(0)->nodeValue;
$data_array['link'] = $link_element->item(0)->nodeValue;
$data_array['latitude'] = /*(float)*/ $latitude_element->item(0)->nodeValue;
$data_array['longitude'] = /*(float)*/ $longitude_element->item(0)->nodeValue;
$data_array['altitude'] = /*(float)*/ $altitude_element->item(0)->nodeValue;
$data_array['time'] = $time_element->item(0)->nodeValue;

$data_json = json_encode($data_array);
if (!$data_json) {
    send_error(1, 'Error: can\'t convert data to json.');
    die();
}

$response_json =  process_request(WRITE_TAG_METHOD_URL, $data_json, 'Content-Type:application/json');
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

send_result(0, 'success', '');
?>

