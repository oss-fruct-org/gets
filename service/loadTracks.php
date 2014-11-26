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

if (!$dom->schemaValidate('schemes/loadTracks.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$category_name = get_request_argument($dom, 'category_name');
$space_arg = get_request_argument($dom, 'space');

$radius = get_request_argument($dom, 'radius', 0);
$longitude = get_request_argument($dom, 'longitude', 0);
$latitude = get_request_argument($dom, 'latitude', 0);

$is_radius_filter = ($radius !== 0);

$space = SPACE_ALL;
if ($space_arg) {
    if ($space_arg === 'public') {
        $space = SPACE_PUBLIC;
    } elseif ($space_arg === 'private') {
        $space = SPACE_PRIVATE;
    }
}

if ($space === SPACE_PRIVATE && !$auth_token) {
    send_error(1, 'Private space requires auth_token');
    die();
}

if ($space === SPACE_ALL && !$auth_token) {
    $space = SPACE_PUBLIC;
}

$dbconn = pg_connect(GEO2TAG_DB_STRING);

// email where query
$where_arr = array();
$email_where_arr = array();
if ($space === SPACE_ALL || $space === SPACE_PRIVATE) {
    try {
        auth_set_token($auth_token);
        $private_email = auth_get_google_email();
        $private_email_escaped = pg_escape_string($dbconn, $private_email);
        session_commit();
    } catch (GetsAuthException $ex) {
        send_error(1, $ex->getMessage());
        die();
    }

    $email_where_arr[] = "users.email='${private_email_escaped}'";
    $access_row = "users.email='${private_email_escaped}' AS permission";
} else {
    $private_email = null;
    $access_row = 'false AS permission';
}

if ($space === SPACE_ALL || $space === SPACE_PUBLIC) {
    $email_escaped = pg_escape_string($dbconn, GEO2TAG_EMAIL);
    $email_where_arr[] = "users.email='${email_escaped}'";
}

$query =  "SELECT DISTINCT ON (channel.name) channel.name, channel.description, channel.url, ${access_row} FROM channel ";

if ($is_radius_filter) {
    $query .= 'INNER JOIN tag ON tag.channel_id = channel.id ';
}

$query .= 'INNER JOIN subscribe ON channel.id = subscribe.channel_id ';
$query .= 'INNER JOIN users ON subscribe.user_id=users.id ';

if ($category_name) {
    $query .= 'INNER JOIN category ON safe_cast_to_json(channel.description)->>\'category_id\'=category.id::text ';
}

$email_where = '(' . implode(' OR ', $email_where_arr) . ')';

$where_arr[] = $email_where;
if ($category_name) {
    $category_name_escaped = pg_escape_string($dbconn, $category_name);
    $where_arr[] = "category.name='${category_name_escaped}'";
}

$where_arr[] = "(substr(channel.name, 0, 4)='tr+' OR substr(channel.name, 0, 4)='tr_')";

# Distance where
if ($is_radius_filter) {
    $where_arr[] = "gets_geo_distance(tag.latitude, tag.longitude, ${latitude}, ${longitude}) < ${radius}";
}

$query .= 'WHERE ' . implode(' AND ', $where_arr) . ' ORDER BY channel.name ASC, permission DESC;';
$result = pg_query($dbconn, $query);

$resp = '<tracks>';
while ($row = pg_fetch_row($result)) {
    $channel_name = $row[0];
    $channel_desc = $row[1];
    $channel_url = $row[2];
    $access = $row[3] == 'f' ? 'r' : 'rw';

    $channel_description = null;
    $channel_category_id = null;
    $channel_lang = null;
    $channel_hname = null;

    $desc_arr = json_decode($channel_desc, true);
    if ($desc_arr) {
        $channel_description = get_array_element($desc_arr, 'description');
        $channel_category_id = get_array_element($desc_arr, 'category_id');
        $channel_lang = get_array_element($desc_arr, 'lang');
        $channel_hname = get_array_element($desc_arr, 'hname');
    }

    $resp .= '<track>';
    $resp .= '<name>' . htmlspecialchars($channel_name) . '</name>';
    $resp .= '<description>' . htmlspecialchars($channel_description) . '</description>';
    $resp .= '<category_id>' . $channel_category_id . '</category_id>';

    if ($channel_lang)
        $resp .= '<lang>' . htmlspecialchars($channel_lang) . '</lang>';

    if ($channel_hname)
        $resp .= '<hname>' . htmlspecialchars($channel_hname) . '</hname>';

    $resp .= '<access>' . $access . '</access>';
    $resp .= '</track>';
}

$resp .= '</tracks>';

pg_close($dbconn);

send_result(0, 'success', $resp);

?>
