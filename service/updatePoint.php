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

if (!$dom->schemaValidate('schemes/updatePoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$uuid = get_request_argument($dom, 'uuid');
$channel_name = get_request_argument($dom, 'channel');
$point_name = get_request_argument($dom, 'name');
$point_category = get_request_argument($dom, 'category_id');

$extended_data_element = $dom->getElementsByTagName('extended_data');
$description_element = $dom->getElementsByTagName('description');

if (!$uuid && !$channel_name && !$point_name && !$point_category) {
    send_error(1, 'No filter criteria specified');
    die();
}

$new_label = get_request_argument($dom, 'title');
$new_url = get_request_argument($dom, 'link');
$new_description = get_request_argument($dom, 'description');
$new_longitude = get_request_argument($dom, 'longitude');
$new_altitude = get_request_argument($dom, 'altitude');
$new_latitude = get_request_argument($dom, 'latitude');

$extended_data_array = parse_extended_data($description_element, $extended_data_element);
if (array_key_exists('uuid', $extended_data_array)) {
    unset($extended_data_array['uuid']);
}

$dbconn = pg_connect(GEO2TAG_DB_STRING);
auth_set_token($auth_token);

try {
    $email = auth_get_google_email();
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$where_arr = array('TRUE');

// Point name condition
if ($point_name) {
    $point_name_escaped = pg_escape_string($dbconn, $point_name);
    $where_arr[] = "tag.label='${point_name}'";
}

// Point category condition
if ($point_category) {
    $point_category_escaped = pg_escape_string($dbconn, $point_category);
    $where_arr[] = "safe_cast_to_json(tag.description)->>'category_id'='${point_category_escaped}'";
}

// UUID condition
if ($uuid) {
    $uuid_escaped = pg_escape_string($dbconn, $uuid);
    $where_arr[] = "safe_cast_to_json(tag.description)->>'uuid'='${uuid_escaped}'";
}

// Channel name condition
if ($channel_name) {
    $channel_name_escaped = pg_escape_string($dbconn, $channel_name);
    $where_arr[] = "channel.name='${channel_name_escaped}'";
}

// User account condition
$email_escaped = pg_escape_string($dbconn, $email);
$where_arr[] = "users.email='${email_escaped}'";
$select_where = implode(' AND ', $where_arr);

$select_query = "SELECT tag.id, tag.description FROM tag
    INNER JOIN channel ON tag.channel_id=channel.id 
    INNER JOIN users ON channel.owner_id=users.id 
    WHERE ${select_where}";

function add_set_string($field, $value, &$out_arr) {
    global $dbconn;
    if ($value) {
        $key = $field;
        $value = pg_escape_string($dbconn, $value);

        $out_arr[] = "{$key}='{$value}'";
    }
}

$set_array = array();
add_set_string('label', $new_label, $set_array);
add_set_string('url', $new_url, $set_array);
add_set_string('latitude', $new_latitude, $set_array);
add_set_string('longitude', $new_longitude, $set_array);
add_set_string('altitude', $new_altitude, $set_array);

$count = 0;
$select_res = pg_query($dbconn, $select_query);
while ($row = pg_fetch_row($select_res)) {
    $existing_id = $row[0];

    $existing_description = $row[1];
    $description_array = json_decode($existing_description, true);
    if (!$description_array) {
        $description_array = $extended_data_array;
    } else {
        foreach ($extended_data_array as $key => $value) {
            $description_array[$key] = $value;
        }
    }

    $description = json_encode($description_array);

    $set_array_copy = $set_array;
    $set_array_copy[] = "description='" . pg_escape_string($dbconn, $description) . "'";

    $set_string = implode($set_array_copy, ',');
    $base_query = "UPDATE tag SET ${set_string} WHERE tag.id = ${existing_id} RETURNING tag.id;";
    $res = pg_query($dbconn, $base_query);
    if (!$res) {
        send_error(1, "Database error");
        die();
    }

    $count += 1;
}

send_result(0, "Tag successfully updated", "$count");