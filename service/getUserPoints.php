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

if (!$dom->schemaValidate('schemes/getUserPoints.xsd')) {
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

$result = pg_query_params($dbconn, 'SELECT * FROM tag WHERE user_id = $1 ORDER BY id',
                           array($send_id));

$xml = '<tags>';

while ($row = pg_fetch_row($result)) {
    $xml .= '<tag>';

    /*foreach ($row as $key => $value) {
   
            $xml .= "<${key}>${value}</${key}>";

    }*/
    

    // main fields    
    $xml_id = htmlspecialchars($row[0]);
    $xml_time = htmlspecialchars($row[1]);
    $xml_altitude = htmlspecialchars($row[2]);
    $xml_latitude = htmlspecialchars($row[3]);
    $xml_longitude = htmlspecialchars($row[4]);
    $xml_label = htmlspecialchars($row[5]);
    $xml_channel = htmlspecialchars($row[9]);
    
    $xml .= "<id>${xml_id}</id>";
    $xml .= "<time>${xml_time}</time>";
    $xml .= "<altitude>${xml_altitude}</altitude>";
    $xml .= "<latitude>${xml_latitude}</latitude>";
    $xml .= "<longitude>${xml_longitude}</longitude>";
    $xml .= "<label>${xml_label}</label>";
    $xml .= "<channel>${xml_channel}</channel>";

    // description field
    $xml .= "<info>";      
    $json = $row[6];
    $jsonArr = json_decode($json, true);       
    if(JSON_ERROR_NONE == json_last_error()){   
        foreach ($jsonArr as $key => $value) { 

            $newValue = htmlspecialchars($value);
            $newKey = htmlspecialchars($key);
            $xml .= "<${newKey}>${newValue}</${newKey}>";        
        }
    }else{
        $xml .= "<url>" . htmlspecialchars($json) . "</url>"; 
    }
    
    $xml .= "</info>";


    // url
    $xml .= "<url>";
    $json = $row[7];
    $jsonArr = json_decode($json, true);
    foreach ($jsonArr as $key => $value) {

        $newKey = htmlspecialchars($key); 
        $xml .= "<${newKey}>";
        if(is_array ($value)){
            foreach ($value as $val) {    

                $newVal = htmlspecialchars($val);
                $xml .= "<snap>${newVal}</snap>";        
            }
        } else{
            $xml .= htmlspecialchars($value);
        }     
        $xml .= "</${newKey}>";        
    }
    $xml .= "</url>";


    $xml .= '</tag>';
}

$xml .= '</tags>';

send_result(0, 'success', $xml);

include_once('include/php-ga.inc');

?>
