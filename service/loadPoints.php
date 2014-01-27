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

if (!$dom->schemaValidate('schemes/loadPoints.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

////////////////////////////////////////////////

$auth_token_element = $dom->getElementsByTagName('auth_token');
$category_id_element = $dom->getElementsByTagName('category_id');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$radius_element = $dom->getElementsByTagName('radius');

$is_auth_token_defined = $auth_token_element->length > 0;
$category_condition = $category_id_element->length > 0;
$location_condition = ($latitude_element->length > 0) && 
                    ($longitude_element->length > 0) && 
                    ($radius_element->length > 0);

					   
$category_id = $category_condition ? 
                htmlspecialchars($category_id_element->item(0)->nodeValue) : 
		-1;

$data_array = array();

// We use cached token, not new
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


$category_name = 'any';
if ($category_id != -1) {
    $categories_request_content = '<?xml version="1.0" encoding="UTF-8"?><request><params></params></request>';
    $categories_response = process_request(GET_CATEGORIES_METHOD_URL_GETS, 
                                    $categories_request_content, 
                                    'Content-Type: text/xml');
    if (!$categories_response) {
        send_error(1, 'Error: can\'t get categories.');
        die();
    }
    $categories_response_dom = new DOMDocument();
    $categories_response_dom->loadXML($categories_response);
    if (!$categories_response_dom) {
        send_error(1, 'Error: categories response is not xml file.');
        die();
    }
    $flag = false;
    $category_elements = $categories_response_dom->getElementsByTagName('category');
    foreach($category_elements as $category) {
        if ($category_id == $category->getElementsByTagName('id')->item(0)->nodeValue) {
            $category_name = 'ca_' . $category->getElementsByTagName('name')->item(0)->nodeValue;
            $flag = true;
            break;
        }
    }
    
    if (!$flag) {
        send_error(1, 'Error: no category with given id in the system.');
        die();
    }
}

$request_type = '';
if ($category_condition && $location_condition) {
	$data_array['latitude'] = floatval($latitude_element->item(0)->nodeValue);
	$data_array['longitude'] = floatval($longitude_element->item(0)->nodeValue);
	$data_array['radius'] = floatval($radius_element->item(0)->nodeValue);
	$data_array['time_from'] = '01 01 1999 00:00:00.000';
	$data_array['time_to'] = '01 01 2099 00:00:00.000';
	$data_array['channel'] = $category_name;
	$request_type = LOAD_POINTS_METHOD_URL;
} else if ($category_condition) {
	$data_array['channel'] = $category_name;
	$data_array['amount'] = 10000;
	$request_type = FILTER_CHANNEL_METHOD_URL;
} else {
	$data_array['latitude'] = floatval($latitude_element->item(0)->nodeValue);
	$data_array['longitude'] = floatval($longitude_element->item(0)->nodeValue);
	$data_array['radius'] = floatval($radius_element->item(0)->nodeValue);
	$data_array['time_from'] = '01 01 1999 00:00:00.000';
	$data_array['time_to'] = '01 01 2099 00:00:00.000';
	$request_type = LOAD_POINTS_METHOD_URL;
}

function process_load_points_request($data_array, $request_type) {
    $data_json = json_encode($data_array);
    if (!$data_json) {
        send_error(1, 'Error: can\'t convert data to json.');
        die();
    }

    $response_json = process_request($request_type, $data_json, 'Content-Type:application/json');
    if (!$response_json) {
        send_error(1, 'Error: problem with request to geo2tag.');
        die();
    }
    ////////////////////////////////////

    $response_array = json_decode($response_json, true);
    if (!$response_array) {
        send_error(1, 'Error: can\'t decode data from geo2tag.');
        die();
    }

    return $response_array;
}

$response_array = process_load_points_request($data_array, $request_type);

$response_code = check_errors($response_array['errno']);

// Geo2tag server requires authentication and we're using cached token
if ($response_code === 'Wrong token error' and $old_token) {
    // Try receive new token from server
    $token = receive_public_token();
    if (!$token) {
        send_error(1, 'Error: can\'t receive new token');
        die();
    }

    // Send request with new token
    $data_array['auth_token'] = $token;
    $response_array = process_load_points_request($data_array, $request_type);
    $response_code = check_errors($response_array['errno']);

    // Same error, new token invalid
    if ($response_code === 'Wrong token error') { 
        send_error(1, 'Error: geo2tag server returned invalid token');
        die();
    }
}

if ($response_code != 'Ok') {
    send_error(1, $response_code);
    die();
}

$xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
$xml .= '<Document>';
$xml .= '<name>' . $category_name . '.kml</name>';
$xml .= '<open>1</open>';
$xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

if ($location_condition) {
	foreach($response_array['channels'] as $channel) {
		foreach($channel['channel']['items'] as $item) {
			$xml .= '<Placemark>';
			$xml .= '<name>' . htmlspecialchars($item['title']) . '</name>';
			$xml .= '<description>' . '<![CDATA[' .  $item['description'] . ']]>' . '</description>';
			$xml .= '<ExtendedData><Data name="url"><value>' . htmlspecialchars($item['link']) . '</value></Data></ExtendedData>';
			$xml .= '<Point><coordinates>' . $item['latitude'] . ',' . $item['longitude'] . ',0.0' . '</coordinates></Point>';
			$xml .= '</Placemark>';
		}
	}
} else {
	foreach($response_array['channel']['items'] as $item) {
		$xml .= '<Placemark>';
		$xml .= '<name>' . htmlspecialchars($item['title']) . '</name>';
		$xml .= '<description>' . '<![CDATA[' .  $item['description'] . ']]>' . '</description>';
		$xml .= '<ExtendedData><Data name="url"><value>' . htmlspecialchars($item['link']) . '</value></Data></ExtendedData>';
		$xml .= '<Point><coordinates>' . $item['latitude'] . ',' . $item['longitude'] . ',0.0' . '</coordinates></Point>';
		$xml .= '</Placemark>';
	}	
}

$xml .= '</Document>';
$xml .= '</kml>';

send_result(0, 'success', $xml);
?>
