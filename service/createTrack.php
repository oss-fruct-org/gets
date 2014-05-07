<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/geo2tag_errors_list.inc');

header ('Content-Type:text/xml');

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

if (!$dom->schemaValidate('schemes/createTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$data_array = array();

$auth_token = get_request_argument($dom, 'auth_token');
$description = get_request_argument($dom, 'description');
$url = get_request_argument($dom, 'url');
$name = get_request_argument($dom, 'name');
$category_id = get_request_argument($dom, 'category_id', -1);
$lang = get_request_argument($dom, 'lang');
$hname = get_request_argument($dom, 'hname');

$desc_array = array();
$desc_array['description'] = $description;
$desc_array['categoryId'] = $category_id;
if ($lang) $desc_array['lang'] = $lang;
if ($hname) $desc_array['hname'] = $hname;
$desc_json = json_encode($desc_array);

$data_array['auth_token'] = $auth_token;
$data_array['description'] = $desc_json;
$data_array['url'] = $url;
$data_array['name'] = $name;

$data_json = json_encode($data_array);


// Create channel request
$response_json = process_request(ADD_CHANNEL_METHOD_URL, $data_json, 'Content-Type:application/json');
if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

$response_string = check_errors($response_array['errno']);
$response_code = $response_array['errno'];
if ($response_code === CHANNEL_ALREADY_EXIST_ERROR) {
    send_error(2, $response_string);
    die();
} else if ($response_code !== SUCCESS) {
    send_error(1, $response_string);
    die();
}

// Subscribe channel request
$subs_array = array();
$subs_array['auth_token'] = $auth_token;
$subs_array['channel'] = $name;

$subs_json = json_encode($subs_array);

$response_json = process_request(SUBSCRIBE_METHOD_URL, $subs_json, 'Content-Type:application/json');
if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

$response_string = check_errors($response_array['errno']);
$response_code = $response_array['errno'];

if ($response_code !== SUCCESS) {
    send_error(1, $response_string);
    die();
}


send_result(0, 'success', '');

?>
