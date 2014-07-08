<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/auth.inc');

header ('Content-Type:text/xml');
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

if (!$dom->schemaValidate('schemes/updatePoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$uuid = get_request_argument($dom, 'uuid');
$channel_name = get_request_argument($dom, 'channel');
$point_name = get_request_argument($dom, 'name');
$point_category = get_request_argument($dom, 'category_id');

if (!$uuid && !$channel_name && !$point_name && !$point_category) {
    send_error(1, 'No filter criteria specified');
    die();
}

$new_label = get_request_argument($dom, 'title');
$new_url = get_request_argument($dom, 'link');
$new_description = get_request_argument($dom, 'description');
$new_longitude = get_request_argument($dom, 'longitude');
$new_altitude = get_request_argument($dom, 'altitude');
$new_latitude = get_request_argument($dom, 'latitude');

$xmlrpc_array = array('gets_token' => $auth_token);
if ($point_name)
    $xmlrpc_array['name'] = $point_name;
if ($point_category)
    $xmlrpc_array['category_name'] = $point_category;
if ($channel_name)
    $xmlrpc_array['channel'] = $channel_name;
if ($uuid)
    $xmlrpc_array['uuid'] = $uuid;

if ($new_label !== null) $xmlrpc_array['label'] = $new_label;
if ($new_url !== null) $xmlrpc_array['url'] = $new_url;
if ($new_description !== null) $xmlrpc_array['description'] = $new_description;
if ($new_latitude !== null) $xmlrpc_array['latitude'] = $new_latitude;
if ($new_longitude !== null) $xmlrpc_array['longitude'] = $new_longitude;
if ($new_altitude !== null) $xmlrpc_array['altitude'] = $new_altitude;


$xmlrpc_request = xmlrpc_encode_request('updateTag', $xmlrpc_array);

$xmlrpc_response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $xmlrpc_request, 'Content-Type: text/xml');
$xmlrpc = xmlrpc_decode($xmlrpc_response);

if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
    send_error(1, 'Error: internal error: can\'t update point');
    die();
}

send_result(0, "Tag successfully updated", $xmlrpc);

?>
