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

if ($description_element->length > 0) {
    $description = $description_element->item(0)->nodeValue;

    # If caller pass extended data in description, process it correctly
    $extended_data_array = json_decode($description, true);
    if (!$extended_data_array) {
        $extended_data_array = array();
    } else {
        $description = null;
    }
} else {
    $description = null;
    $extended_data_array = array();
}

$extended_data_element = $dom->getElementsByTagName('extended_data');

if ($extended_data_element->length > 0) {
    foreach ($extended_data_element->item(0)->childNodes as $node) {
        $key = $node->nodeName;
        $value = $node->nodeValue;
        $extended_data_array[$key] = $value;
    }
}

# Description in extended data overrides main description
if (!array_key_exists("description", $extended_data_array) && $description) {
    $extended_data_array["description"] = $description;
}

if (!array_key_exists("uuid", $extended_data_array)) {
    $extended_data_array["uuid"] = uuidv4();
}

# Description always contains json encoded data
if (function_exists('unicode_json_encode')) {
    $description = unicode_json_encode($extended_data_array);
} else {
    $description = json_encode($extended_data_array, JSON_UNESCAPED_UNICODE);
}


$channel_name = null;
if (!$category_id_defined) {
    $channel_name = $channel_name_element->item(0)->nodeValue;
} else {
    $channel_name = ensure_category_channel($auth_token, $category_id_element->item(0)->nodeValue);
    if (!$channel_name) {
        send_error(1, "Request of category's channel failed");
        die();
    }
}

// if time not defined then set now
if ($time_element->length > 0) {
    $time = $time_element->item(0)->nodeValue;
} else {
    $time = date("d m Y H:i:s.000");
}

$data_array = array();
$data_array['channel'] = $channel_name;
$data_array['title'] = $title_element->item(0)->nodeValue;
$data_array['description'] = $description;

if ($link_element->length > 0 && $link_element->item(0)->nodeValue->length > 0) {
    $data_array['link'] = $link_element->item(0)->nodeValue;
} else {
    $data_array['link'] = "{}";
}

$data_array['latitude'] = /*(float)*/ $latitude_element->item(0)->nodeValue;
$data_array['longitude'] = /*(float)*/ $longitude_element->item(0)->nodeValue;
$data_array['altitude'] = /*(float)*/ ($altitude_element->item(0)->nodeValue == null ? "0.0" : $altitude_element->item(0)->nodeValue);
$data_array['time'] = $time;

try {
    $response_array = process_json_request(WRITE_TAG_METHOD_URL, $data_array, $auth_token);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

send_result(0, 'success', '');
?>

