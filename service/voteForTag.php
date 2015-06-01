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

if (!$dom->schemaValidate('schemes/voteForTag.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$vote_id_element = $dom->getElementsByTagName('vote');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$altitude_element = $dom->getElementsByTagName('altitude');

$auth_token = $auth_token_element->item(0)->nodeValue;
$vote = $vote_id_element->item(0)->nodeValue;
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

$ch_user_id = (int) $user_db_id;

// add voting channels
$description_array = array();
$description_array['description'] = 'channel for voting';
$description_array['category_id'] = 40;
$description_array['lang'] = 'en_US';
$description_data = json_encode($description_array);

$ch_data_array = array();
$ch_data_array['name'] = 0;
$ch_data_array['description'] = $description_data;
$ch_data_array['url'] = 'no url';
$ch_data_array['owner_id'] = $ch_user_id;

$added_channel_array = add_voting_channels($dbconn, $ch_data_array, $ch_user_id);

if (!$added_channel_array) {
    send_error(1, "No channel's id");
    die();   
}

// subscribe admin on voting channels
$admin_token=receive_public_token();
auth_set_token($admin_token);

$admin_subscribed_positive_channel = subscribe_voting_channel($dbconn, $added_channel_array[0]);
$admin_subscribed_negative_channel = subscribe_voting_channel($dbconn, $added_channel_array[1]);

// write tag in voting channel
$voted_tag = write_tag_in_voting_channel($dbconn, $latitude, $longitude, $altitude, $added_channel_array, $vote);
if (!$voted_tag) {
    send_error(1, "Can't write voting tag in DB");
    die();
}

$xml = '<vote>';
$xml_vote = htmlspecialchars($voted_tag);
$xml .= "${xml_vote}";
$xml .= '</vote>';
 
send_result(0, 'success', $xml);
?>
