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

$private_token = get_request_argument($dom, 'auth_token');
$channel_name = get_request_argument($dom, 'name');

$public_token = read_public_token();

if (!$public_token) {
    $public_token = receive_public_token();
    if (!$public_token) {
        send_error(1, 'Error: can\'t receive new token');
        die();
    }
}

if (!try_load_points($private_token, $channel_name, true)) {
    try_load_points($public_token, $channel_name, false);
}


function try_load_points($auth_token, $channel_name, $allow_error) {
    $data_array = array();
    $data_array['auth_token'] = $auth_token;
    $data_array['channel'] = $channel_name;
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
        if (!$allow_error) {
            send_error(1, $response_code);
            die();
        } else {
            return false;
        }
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

    return true;
}


?>

