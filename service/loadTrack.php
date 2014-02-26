<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');

header ('Content-Type:text/xml');

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

$auth_token_element = $dom->getElementsByTagName('auth_token');
$is_auth_token_defined = $auth_token_element->length > 0;

$name_element = $dom->getElementsByTagName('name');
$is_name_defined = $name_element->length > 0;

$old_token = true;
if ($is_auth_token_defined) {
    $data_array['auth_token'] = $auth_token_element->item(0)->nodeValue;
    $old_token = false;
} else {
    $token = read_public_token();

    // No token available, trying to receive it from geo2tag server
    if (!$token) {
        $token = receive_public_token();
        $old_token = false;

        if (!$token) {
            send_error(1, 'Error: can\'t receive new token');
        }
    }

    $data_array['auth_token'] = $token;
}

$data_array['channel'] = $name_element->item(0)->nodeValue;
$data_array['amount'] = 100;

$data_json = json_encode($data_array);
$response_json = process_request(FILTER_CHANNEL_METHOD_URL, $data_json, 'Content-Type:application/json');

if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

$response_code = check_errors($response_array['errno']);
if ($response_code !== "Ok") {
    send_error(1, $response_code);
    die();
}

// Output points
$xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
$xml .= '<Document>';
$xml .= '<name>' . $response_array['channel']['name'] . '.kml</name>';
$xml .= '<open>1</open>';
$xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

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

    if ($description_json) {
        foreach ($description_json as $key => $value) {
            $field = $key;
            $value = htmlspecialchars($value);
        
            $xml .= "<Data name=\"$field\"><value>$value</value></Data>";
        }
    }

    $xml .= '</ExtendedData>';
    
    $xml .= '<Point><coordinates>' . $item['latitude'] . ',' . $item['longitude'] . ',0.0' . '</coordinates></Point>';
    $xml .= '</Placemark>';
}

$xml .= '</Document>';
$xml .= '</kml>';

send_result(0, 'success', $xml);

?>

