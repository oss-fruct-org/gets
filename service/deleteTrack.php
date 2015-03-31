<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
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

if (!$dom->schemaValidate('schemes/deleteTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$track_name = get_request_argument($dom, 'name');

$dbconn = pg_connect(GEO2TAG_DB_STRING);
auth_set_token($auth_token);

try {
    $email = auth_get_google_email();
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$user_is_admin = (is_user_admin($dbconn) > 0 ? true : false);

// admin user not required to check email
if ($user_is_admin) {
    $query = "DELETE FROM channel 
	WHERE channel.name=$1 RETURNING channel.id;";

    $res = pg_query_params($dbconn, $query, array($track_name));
} else {
    $query = "DELETE FROM channel WHERE channel.id IN
	(SELECT channel.id FROM channel
	INNER JOIN users ON channel.owner_id = users.id 
	WHERE users.email=$1 AND channel.name=$2) RETURNING channel.id;";
    
    $res = pg_query_params($dbconn, $query, array($email, $track_name));
}

$count = pg_num_rows($res);

if ($count == 0) {
    send_error(1, "Channel not found");
} else {
    send_result(0, "Channel successfully removed", $count);
}

include_once('include/php-ga.inc');

?>
