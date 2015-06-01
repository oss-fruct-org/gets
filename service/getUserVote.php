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

if (!$dom->schemaValidate('schemes/getUserVote.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$altitude_element = $dom->getElementsByTagName('altitude');

$auth_token = $auth_token_element->item(0)->nodeValue;
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

$query = "SELECT channel.name FROM channel INNER JOIN tag ON channel.id = tag.channel_id ";
$query .= "WHERE tag.latitude = ${latitude} AND tag.longitude = ${longitude} ";
$query .= "AND tag.altitude = ${altitude} AND tag.user_id = ${user_id} AND (channel.name LIKE '%+positive' "; 
$query .= "OR channel.name LIKE '%+negative')";


if (!pg_query($dbconn, $query)) {
   send_error(1, "Can't select tag (getUserVote)");
   die();
} else {
   $result = pg_query($dbconn, $query);
}

$row = pg_fetch_row($result);

if (!$row) {

$xml_type = htmlspecialchars('no vote');
$xml = "<type>${xml_type}</type>";

send_result(0, 'success', $xml);
}

else {

if(strstr($row[0], 'pos')) { 

$channel_type = 'positive';

} 

if(strstr($row[0], 'neg')) {
 
$channel_type = 'negative';

}


$xml_type = htmlspecialchars($channel_type);
$xml = "<type>${xml_type}</type>";

send_result(0, 'success', $xml);

}
?>
