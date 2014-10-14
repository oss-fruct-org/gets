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

if (!$dom->relaxNGValidate('rng-schemes/deletePoint.rng')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$channel_name = get_request_argument($dom, 'track_name');
$category_id = get_request_argument($dom, 'category_id');

$requested_fields = array('uuid', 'name', 'latitude', 'longitude', 'time', 'description');

$xmlrpc_array = array('gets_token' => $auth_token);

// One of track_name or category_id must already be no-null after schema validation
if (!$channel_name) {
    $channel_name = ensure_category_channel($auth_token, $category_id);
    if (!$channel_name) {
        send_error(1, "Request of category's channel failed");
        die();
    }
}

$xmlrpc_array['channel'] = $channel_name;
foreach ($requested_fields as $field) {
    $value = get_request_argument($dom, $field);
    if ($value) {
        $xmlrpc_array[$field] = $value;
    }
}

$xmlrpc_request = xmlrpc_encode_request('deleteTag2', $xmlrpc_array);

$xmlrpc_response =  process_request(GETS_SCRIPTS_URL, $xmlrpc_request, 'Content-Type: text/xml');
$xmlrpc = xmlrpc_decode($xmlrpc_response);

if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
    send_error(1, 'Error: internal error: can\'t delete tag');
    die();
}

send_result(0, "Tag successfully removed", $xmlrpc);

?>
