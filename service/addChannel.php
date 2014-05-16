<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');

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

if (!$dom->schemaValidate('schemes/addChannel.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$name_element = $dom->getElementsByTagName('name');
$description_element = $dom->getElementsByTagName('description');
$url_element = $dom->getElementsByTagName('url');
$lang_element = $dom->getElementsByTagName('lang');
$category_id_element = $dom->getElementsByTagName('category_id');
$active_radius_element = $dom->getElementsByTagName('active_radius');

$description_data = '{"description":"' . $description_element->item(0)->nodeValue . 
                    '", "category_id":"' . $category_id_element->item(0)->nodeValue . 
                    '", "lang":"' . $lang_element->item(0)->nodeValue . '"}';

$auth_token = $auth_token_element->item(0)->nodeValue;
try {
    auth_set_token($auth_token);
    $auth_token = auth_get_geo2tag_token();
} catch (GetsAuthException $e) {
    send_error(1, $e->getMessage());
    die();
}

$data_array = array();
$data_array['auth_token'] = $auth_token;
$data_array['name'] = $name_element->item(0)->nodeValue;
$data_array['description'] = $description_data;
$data_array['url'] = $url_element->item(0)->nodeValue;
$data_array['activeRadius'] = $active_radius_element->item(0)->nodeValue;

$data_json = json_encode($data_array);
if (!$data_json) {
    send_error(1, 'Error: can\'t convert data to json.');
    die();
}

$response_json =  process_request(ADD_CHANNEL_METHOD_URL, $data_json, 'Content-Type:application/json');
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

