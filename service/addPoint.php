<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('datatypes/point.inc');

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

$point = Point::makeFromXmlRequest($dom);

$channel_name = get_request_argument($dom, "channel");
$category_id = get_request_argument($dom, "category_id");

$auth_token = get_request_argument($dom, "auth_token");
auth_set_token($auth_token);

$dbconn = pg_connect(GEO2TAG_DB_STRING);

if ($category_id){
    $point->category_id = $category_id;

    try {
        require_category($dbconn, $category_id);
        $channel_name = ensure_category_channel($dbconn, $category_id);
    } catch (Exception $e) {
        send_error(1, $e->getMessage());
        die();
    }

    if (!$channel_name) {
        send_error(1, "Request of category's channel failed");
        die();
    }
}

// Check permission
try {
    list($user_id, $channel_id) = require_channel_owned($dbconn, $channel_name);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}

$pg_array = $point->toPgArray($user_id, $channel_id);

if (!safe_pg_insert($dbconn, 'tag', $pg_array)) {
    send_error(1, 'Can\'t insert point to database');
} else {
    $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
    $xml .= '<Document>';
    $xml .= '<name>any.kml</name>';
    $xml .= '<open>1</open>';
    $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';
    $xml .= $point->toKmlPlacemark();
    $xml .= '</Document></kml>';
    
    send_result(0, 'success', $xml);
}

