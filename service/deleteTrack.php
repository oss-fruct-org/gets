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

if (!$dom->schemaValidate('schemes/deleteTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$track_name = get_request_argument($dom, 'name');

// First, receive list of channels, subscribed by user 
$data_array = array();
$data_array['auth_token'] = $auth_token;

$data_json = json_encode($data_array);
$response_json = process_request(SUBSCRIBED_METHOD_URL, $data_json, 'Content-Type:application/json');

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

foreach ($response_array['channels'] as $channel) {
    $channel_name = $channel['name'];

    if ($track_name === $channel_name) {
        $channel_name_found = $channel_name;
        break;
    }
}

if (!$channel_name_found) {
    send_error(1, 'Error: channel not subscribed');
    die();
}

$xmlrpc_request = xmlrpc_encode_request('deleteChannel', 
    array('login' => GEO2TAG_USER, 
          'password' => GEO2TAG_PASSWORD,
          'user' => 'unknown', 
          'channel' => $channel_name_found));

$xmlrpc_response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $xmlrpc_request, 'Content-Type: text/xml');
$xmlrpc = xmlrpc_decode($xmlrpc_response);

if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
    send_error(1, 'Error: internal error: can\'t delete channeld');
    die();
}

send_result(0, "Channel successfully removed", $xmlrpc);

?>
