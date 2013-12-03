<?php
include_once('methods_url.php');
include_once('process_request.php');
include_once('utils.inc');

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
$category_name_element = $dom->getElementsByTagName('category_name');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$radius_element = $dom->getElementsByTagName('radius');

$category_condition = $category_name_element->length > 0;
$location_condition = ($latitude_element->length > 0) && 
					   ($longitude_element->length > 0) && 
					   ($radius_element->length > 0);

					   
$category_name = $category_condition ? 
				 htmlspecialchars($category_name_element->item(0)->nodeValue) : 
				 'any';

$data_array = array();
$data_array['auth_token'] = $auth_token_element->item(0)->nodeValue;
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

$response_code = check_errors($response_array['errno']);
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
