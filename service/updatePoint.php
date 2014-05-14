<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');

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

if (!$dom->schemaValidate('schemes/updatePoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$channel_name = get_request_argument($dom, 'channel');
$point_name = get_request_argument($dom, 'name');
$point_category = get_request_argument($dom, 'category_id');

$new_label = get_request_argument($dom, 'label');
$new_url = get_request_argument($dom, 'url');
$new_description = get_request_argument($dom, 'description');
$new_longitude = get_request_argument($dom, 'longitude');
$new_altitude = get_request_argument($dom, 'altitude');
$new_latitude = get_request_argument($dom, 'latitude');

// First, receive list of channels, subscribed by user 
$data_array = array();
$data_array['auth_token'] = $auth_token;

$data_json = json_encode($data_array);
$response_json = process_request(SUBSCRIBED_CHANNELS_METHOD_URL, $data_json, 'Content-Type:application/json');

if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

if ($response_array['errno'] !== 0) {
    send_error(1, 'Error: can\'t receive channel list from geo2tag server');
    die();
}


$channel_name_found = null;
if (array_key_exists('channels', $response_array)) {
    foreach ($response_array['channels'] as $channel) {
        $subscribed_channel_name = $channel['name'];

        if ($subscribed_channel_name === $channel_name) {
            $channel_name_found = $channel_name;
            break;
        }
    }
}

// Don't allow to update tags in channel not subscribed
if (!$channel_name_found) {
    send_error(1, 'Error: channel not subscribed');
    die();
}

$xmlrpc_array = array('channel' => $channel_name);
if ($point_name)
    $xmlrpc_array['name'] = $point_name;
if ($point_category)
    $xmlrpc_array['category_name'] = $point_category;

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
    send_error(1, 'Error: internal error: can\'t delete channeld');
    die();
}

send_result(0, "Tag successfully updated", $xmlrpc);

?>
