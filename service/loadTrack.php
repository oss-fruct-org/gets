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

if (!$dom->schemaValidate('schemes/loadTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$channel_name = get_request_argument($dom, 'name');

if ($auth_token) {
    set_auth_token($auth_token);
}

$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    list($user_id, $channel_id) = require_channel_subscribed($dbconn, $channel_name, $auth_token == null);
} catch (Exception $ex) {
    send_error(1, $ex->getMessage());
    die();
}

$result_tag = pg_query_params($dbconn, 'SELECT time, label, latitude, longitude, altitude, description, url FROM tag WHERE tag.channel_id=$1 ORDER BY time;',
        array($channel_id));

$xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
$xml .= '<Document>';
$xml .= '<name>' . $channel_name . '.kml</name>';
$xml .= '<open>1</open>';
$xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

// Output points
while ($row = pg_fetch_row($result_tag)) {
    $datetime = $row[0];
    $label = $row[1];
    $latitude = $row[2];
    $longitude = $row[3];
    $altitude = $row[4];
    $description = $row[5];
    $url = $row[6];

    // Try parse description json
    $description_json = json_decode($description, true);

    //Get inner description
    $inner_description = null;
    if ($description_json) {
        $inner_description = $description_json['description'];
    }

    $xml .= '<Placemark>';
    $xml .= '<name>' . htmlspecialchars($label) . '</name>';

    if (!$description_json)
        $xml .= '<description>' . '<![CDATA[' .  $description . ']]>' . '</description>';
    else if ($inner_description)
        $xml .= '<description>' . '<![CDATA[' .  $inner_description . ']]>' . '</description>';
    else
        $xml .= '<description></description>';

    $xml .= '<ExtendedData>';
    $xml .= '<Data name="url"><value>' . htmlspecialchars($url) . '</value></Data>';
    $xml .= '<Data name="time"><value>' . htmlspecialchars($datetime) . '</value></Data>';

    if ($description_json) {
        foreach ($description_json as $key => $value) {
            $field = $key;
            $value = htmlspecialchars($value);

            $xml .= "<Data name=\"$field\"><value>$value</value></Data>";
        }
    }

    $xml .= '</ExtendedData>';

    $xml .= '<Point><coordinates>' . $longitude . ',' . $latitude . ',0.0' . '</coordinates></Point>';
    $xml .= '</Placemark>';
}

$xml .= '</Document>';
$xml .= '</kml>';

send_result(0, 'success', $xml);

?>

