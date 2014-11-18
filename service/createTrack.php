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

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

$prefix = substr($name, 0, 3);
if ($prefix === 'tr_' || $prefix === 'tr+') {
    # Compatibility with old clients that pass track name in format "tr_"
    $track_id = $name;
} else {
    $username = auth_get_db_login($dbconn);
    $track_id = "tr+${username}+${name}+${lang}";

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
    $user_id = auth_get_db_id($dbconn, $auth_token);
    $existing_channel_id = get_channel_id($dbconn, $track_id);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

if (!$user_id) {
    send_error(1, 'Can\'t get user id by token');
    die();
}

if ($existing_channel_id && !$need_update) {
    send_error(2, 'Channel already exists');
    die();
}

if ($need_update) {
    if (!pg_query_params($dbconn, 'UPDATE channel SET name=$1, description=$2, url=$3, owner_id=$4;', 
                array($track_id, $desc_json, $url, $user_id))) {
        send_error(1, 'Database error');
        die();
    }
} else {
    if (!($result_insert = pg_query_params($dbconn, 'INSERT INTO channel (name, description, url, owner_id) VALUES ($1, $2, $3, $4) RETURNING channel.id;', 
                array($track_id, $desc_json, $url, $user_id)))) {
        send_error(1, 'Database error');
        die();
    }

    $result_inserted_id = pg_fetch_row($result_insert)[0];

    if (!pg_query_params($dbconn, 'INSERT INTO subscribe (channel_id, user_id) VALUES ($1, $2);', 
                array($result_inserted_id, $user_id))) {
        send_error(1, 'Database error');
        die();
    }
}

$track_id_escaped = htmlspecialchars($track_id);
$response = "<track_id>${track_id_escaped}</track_id>";
send_result(0, 'success', $response);

?>
