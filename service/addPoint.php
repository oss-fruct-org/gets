<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');


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

$auth_token_element = $dom->getElementsByTagName('auth_token');

$channel_name_element = $dom->getElementsByTagName('channel');
$category_id_element = $dom->getElementsByTagName('category_id');
$category_id_defined = $category_id_element->length > 0;

$title_element = $dom->getElementsByTagName('title');
$description_element = $dom->getElementsByTagName('description');
$link_element = $dom->getElementsByTagName('link');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$altitude_element = $dom->getElementsByTagName('altitude');
$time_element = $dom->getElementsByTagName('time');

$auth_token = $auth_token_element->item(0)->nodeValue;

$extended_data_element = $dom->getElementsByTagName('extended_data');

$extended_data_array = parse_extended_data($description_element, $extended_data_element);

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

$channel_name = null;
if (!$category_id_defined) {
    $channel_name = $channel_name_element->item(0)->nodeValue;
} else {
    $category_id = $category_id_element->item(0)->nodeValue;

    $extended_data_array["category_id"] = $category_id;

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

# Description always contains json encoded data
if (function_exists('unicode_json_encode')) {
    $description = unicode_json_encode($extended_data_array);
} else {
    $description = json_encode($extended_data_array, JSON_UNESCAPED_UNICODE);
}

// if time not defined then set now
if ($time_element->length > 0) {
    $time = date_gets_to_postgres($time_element->item(0)->nodeValue);
}

$data_array = array();
$data_array['label'] = $title_element->item(0)->nodeValue;
$data_array['description'] = $description;

if ($link_element->length > 0 && strlen($link_element->item(0)->nodeValue) > 0) {
    $data_array['url'] = $link_element->item(0)->nodeValue;
} else {
    $data_array['url'] = "{}";
}

$data_array['latitude'] = /*(float)*/ $latitude_element->item(0)->nodeValue;
$data_array['longitude'] = /*(float)*/ $longitude_element->item(0)->nodeValue;
$data_array['altitude'] = /*(float)*/ ($altitude_element->item(0)->nodeValue == null ? "0.0" : $altitude_element->item(0)->nodeValue);

if (isset($time)) {
  $data_array['time'] = $time;
}

# Check permission
try {
    list($user_id, $channel_id) = require_channel_owned($dbconn, $channel_name);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}

$data_array['channel_id'] = $channel_id;
$data_array['user_id'] = $user_id;

if (!safe_pg_insert($dbconn, 'tag', $data_array)) {
    send_error(1, 'Can\'t insert point to database');
} else {
    send_result(0, 'success', '');
}

