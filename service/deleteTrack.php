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

if (!$dom->schemaValidate('schemes/deleteTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$track_name = get_request_argument($dom, 'name');

$xmlrpc_request = xmlrpc_encode_request('deleteChannel', 
    array('gets_token' => $auth_token,
          'channel' => $channel_name_found);

$xmlrpc_response =  process_request(ADDITIONAL_FUNCTIONS_METHOD_URL, $xmlrpc_request, 'Content-Type: text/xml');
$xmlrpc = xmlrpc_decode($xmlrpc_response);

if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
    send_error(1, 'Error: internal error: can\'t delete channeld');
    die();
}

send_result(0, "Channel successfully removed", $xmlrpc);

?>
