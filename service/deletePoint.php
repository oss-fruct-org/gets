<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/auth.inc');

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

if (!$dom->schemaValidate('schemes/deletePoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$channel_name = get_request_argument($dom, 'channel');
$point_name = get_request_argument($dom, 'name');
$point_category = get_request_argument($dom, 'category_id');

try {
    auth_set_token($auth_token);
    $auth_token = auth_get_geo2tag_token();
} catch (GetsAuthException $e) {
    send_error(1, $e->getMessage());
    die();
}

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

// Don't allow to delete tags from channel not subscribed
if (!$channel_name_found) {
    send_error(1, 'Error: channel not subscribed');
    die();
}

$xmlrpc_array = array('channel' => $channel_name);
if ($point_name)
    $xmlrpc_array['name'] = $point_name;
if ($point_category)
    $xmlrpc_array['category_name'] = $point_category;

$xmlrpc_request = xmlrpc_encode_request('deleteTag2', $xmlrpc_array);

$xmlrpc_response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $xmlrpc_request, 'Content-Type: text/xml');
$xmlrpc = xmlrpc_decode($xmlrpc_response);

if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
    send_error(1, 'Error: internal error: can\'t delete channeld');
    die();
}

send_result(0, "Tag successfully removed", $xmlrpc);

?>
