<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/geo2tag_errors_list.inc');
include_once('include/auth.inc');

header ('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
} else {
    header('Access-Control-Allow-Origin: *');
}

function update_channel_field($auth_token, $channel, $field, $value) {
    $alter_array = array();
    $alter_array['auth_token'] = $auth_token;
    $alter_array['name'] = $channel;
    $alter_array['field'] = $field;
    $alter_array['value'] = $value;
    process_json_request(ALTER_CHANNEL_METHOD_URL, $alter_array, $auth_token);
}

function create_track_id($gets_token, $name, $lang) {
    auth_set_token($gets_token);
    $username = auth_get_geo2tag_login();
    session_commit();
    return "tr+${username}+${name}+${lang}";
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

if (!$dom->schemaValidate('schemes/createTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$data_array = array();

$auth_token = get_request_argument($dom, 'auth_token');
$description = get_request_argument($dom, 'description');
$url = get_request_argument($dom, 'url');
$name = get_request_argument($dom, 'name');
$category_id = get_request_argument($dom, 'category_id', -1);
$lang = get_request_argument($dom, 'lang');
$hname = get_request_argument($dom, 'hname');

$need_update = get_request_argument($dom, 'update', 'false') === 'true';

if (!$lang)
    $lang = 'en_GB';

$prefix = substr($name, 0, 3);
if ($prefix === 'tr_' || $prefix === 'tr+') {
    # Compatibility with old clients that pass track name in format "tr_"
    $track_id = $name;
} else {
    $track_id = create_track_id($auth_token, $name, $lang);
    if (!$hname)
        $hname = $name;
}


$desc_array = array();
$desc_array['description'] = $description;
$desc_array['category_id'] = $category_id;
$desc_array['lang'] = $lang;
$desc_array['hname'] = $hname;

if (function_exists('unicode_json_encode')) {
    $desc_json = unicode_json_encode($desc_array);
} else {
    $desc_json = json_encode($desc_array, JSON_UNESCAPED_UNICODE);
}

$data_array['description'] = $desc_json;
$data_array['url'] = $url;
$data_array['name'] = $track_id;

try {
    try {
        $response_array = process_json_request(ADD_CHANNEL_METHOD_URL, $data_array, $auth_token);
    } catch (ChannelAlreadyExistException $e) {
        if ($need_update) {
            // Update channel
            update_channel_field($auth_token, $name, 'description', $desc_json);
            update_channel_field($auth_token, $name, 'url', $url);
            // Channel name is internal and shouldn't be updated
        } else {
            send_error(2, 'Channel already exists');
            die();
        }
    }
    try {
        $response_array = process_json_request(SUBSCRIBE_METHOD_URL, Array('channel' => $track_id), $auth_token);
    } catch (ChannelAlreadySubscribedException $e) {
        // Ignore
    }

} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$track_id_escaped = htmlspecialchars($track_id);
$response = "<track_id>${track_id_escaped}</track_id>";
send_result(0, 'success', $response);

?>
