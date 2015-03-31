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

if (!$dom->schemaValidate('schemes/addChannel.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$name_element = $dom->getElementsByTagName('name');
$description_element = $dom->getElementsByTagName('description');
$url_element = $dom->getElementsByTagName('url');
$lang_element = $dom->getElementsByTagName('lang');
$category_id_element = $dom->getElementsByTagName('category_id');
$active_radius_element = $dom->getElementsByTagName('active_radius');

$description_array = array();
$description_array['description'] = $description_element->item(0)->nodeValue;
$description_array['category_id'] = $category_id_element->item(0)->nodeValue;
$description_array['lang'] = $lang_element->item(0)->nodeValue;

$description_data = json_encode($description_array);

$auth_token = $auth_token_element->item(0)->nodeValue;
$channel_name = $name_element->item(0)->nodeValue;

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    $existing_channel = get_channel_id($dbconn, $channel_name);
    $user_id = auth_get_db_id($dbconn);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}

if ($existing_channel) {
    send_error(1, 'Channel already exist error');
    die();
}

$data_array = array();
$data_array['name'] = $name_element->item(0)->nodeValue;
$data_array['description'] = $description_data;
$data_array['url'] = $url_element->item(0)->nodeValue;
$data_array['owner_id'] = (int) $user_id;

if (!pg_insert($dbconn, 'channel', $data_array)) {
    send_error(1, 'Can\'t perform database query');
} else {
    send_result(0, 'success', '');
}

include_once('include/php-ga.inc');

?>

