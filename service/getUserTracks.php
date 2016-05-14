<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/config.inc');
//include_once('include/auth.inc');



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

if (!$dom->schemaValidate('schemes/getUserTracks.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;
$send_id = $dom->getElementsByTagName('id')->item(0)->nodeValue;

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    $user_id = auth_get_db_id($dbconn);
    $owner_id = require_user_admin($dbconn);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$result = pg_query_params($dbconn, 'SELECT * FROM channel WHERE owner_id = $1 AND name LIKE \'tr%\' ORDER BY id',
                           array($send_id));

$xml = '<tracks>';

while ($row = pg_fetch_row($result)) {
    $xml .= '<track>';

    // main fields    
    $xml_id = htmlspecialchars($row[0]);
    $xml_name = htmlspecialchars($row[1]);
    $xml_url = htmlspecialchars($row[3]);
    
    $xml .= "<id>${xml_id}</id>";
    $xml .= "<name>${xml_name}</name>";
    $xml .= "<url>${xml_url}</url>";

    // description field
    $xml .= "<info>";
    $json = $row[2];
    $jsonArr = json_decode($json, true);
    foreach ($jsonArr as $key => $value) {     
       
            $newValue = htmlspecialchars($value);
            $newKey = htmlspecialchars($key);
            $xml .= "<${newKey}>${newValue}</${newKey}>";               
    }
    $xml .= "</info>";  

    $resultTag = pg_query_params($dbconn, 'SELECT id, label FROM tag WHERE channel_id = $1 ORDER BY id',
                           array($xml_id));
    
    $xml .= "<tags>";
    while ($rowTag = pg_fetch_row($resultTag)) {

        $xml .= "<tag>";

        $tag_id = htmlspecialchars($rowTag[0]);
        $tag_name = htmlspecialchars($rowTag[1]);

        $xml .= "<id>${tag_id}</id>";
        $xml .= "<name>${tag_name}</name>";

        $xml .= "</tag>";
    }
    $xml .= "</tags>";

    $xml .= '</track>';
}

$xml .= '</tracks>';

send_result(0, 'success', $xml);

include_once('include/php-ga.inc');

?>
