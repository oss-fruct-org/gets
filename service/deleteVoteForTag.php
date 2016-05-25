<?php 
include_once('include/auth.inc');
include_once('include/voting.inc');
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/config.inc');

//error_reporting(E_ALL);
//ini_set("display_errors", 1);

header('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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

if (!$dom->schemaValidate('schemes/deleteVoteForTag.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$user_vote_element = $dom->getElementsByTagName('user_vote');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$altitude_element = $dom->getElementsByTagName('altitude');

$auth_token = $auth_token_element->item(0)->nodeValue;
$user_vote = $user_vote_element->item(0)->nodeValue;
$latitude = $latitude_element->item(0)->nodeValue;
$longitude = $longitude_element->item(0)->nodeValue;
$altitude = $altitude_element->item(0)->nodeValue;

//recieve user's id
auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
     $user_db_id = auth_get_db_id($dbconn);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}

$user_id = (int) $user_db_id;

$channel_array = array();

// recieve channels' id
if ($user_vote == '1') {
    $voting_channel_positive = 'vote+'. $user_id . '+positive';
try {
    $positive_channel_id = get_channel_id($dbconn, $voting_channel_positive);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}  
  
$channel_array[] = $positive_channel_id;
} 
else if ($user_vote == '2') {
    $voting_channel_negative = 'vote+' . $user_id . '+negative';
try {
    $negative_channel_id = get_channel_id($dbconn, $voting_channel_negative);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}
    
$channel_array[] = $negative_channel_id;
}

$channel_array[] = $user_id;

// delete tag 
try {
    $delete_vote_for_point = delete_vote($dbconn, $latitude, $longitude, $altitude, $channel_array);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}
 
send_result(0, 'success', $delete_vote_for_point);
?>
