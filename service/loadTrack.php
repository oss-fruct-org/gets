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

$public_token = get_public_token();
if (!$public_token) {
    send_error(1, 'Error: can\'t receive new token');
    die();
}

try {
    if ($auth_token) {
        try {
            $response_array = process_json_request(FILTER_CHANNEL_METHOD_URL, Array('channel' => $channel_name, 'amount' => 100), $auth_token);
        } catch (ChannelNotSubscribedException $e) {
            $response_array = process_json_request(FILTER_CHANNEL_METHOD_URL, Array('channel' => $channel_name, 'amount' => 100), $public_token);
        }
    } else {
        $response_array = process_json_request(FILTER_CHANNEL_METHOD_URL, Array('channel' => $channel_name, 'amount' => 100), $public_token);
    }

} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}


$xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
$xml .= '<Document>';
$xml .= '<name>' . $response_array['channel']['name'] . '.kml</name>';
$xml .= '<open>1</open>';
$xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

// Output points
foreach ($response_array['channel']['items'] as $item) {
    $description = $item['description'];

    // Try parse description json
    $description_json = json_decode($description, true);

    //Get inner description
    $inner_description = null;
    if ($description_json) {
        $inner_description = $description_json['description'];
    }

    $xml .= '<Placemark>';
    $xml .= '<name>' . htmlspecialchars($item['title']) . '</name>';

    if (!$description_json)
        $xml .= '<description>' . '<![CDATA[' .  $item['description'] . ']]>' . '</description>';
    else if ($inner_description)
        $xml .= '<description>' . '<![CDATA[' .  $inner_description . ']]>' . '</description>';
    else
        $xml .= '<description></description>';

    $xml .= '<ExtendedData>';
    $xml .= '<Data name="url"><value>' . htmlspecialchars($item['link']) . '</value></Data>';
    $xml .= '<Data name="time"><value>' . htmlspecialchars($item['pubDate']) . '</value></Data>';

    if ($description_json) {
        foreach ($description_json as $key => $value) {
            $field = $key;
            $value = htmlspecialchars($value);

            $xml .= "<Data name=\"$field\"><value>$value</value></Data>";
        }
    }

    $xml .= '</ExtendedData>';

    $xml .= '<Point><coordinates>' . $item['longitude'] . ',' . $item['latitude'] . ',0.0' . '</coordinates></Point>';
    $xml .= '</Placemark>';
}

$xml .= '</Document>';
$xml .= '</kml>';

send_result(0, 'success', $xml);

?>

