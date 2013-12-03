<?php
include_once('XmlParser.class.php');
include_once('methods_url.php');
include_once('process_request.php');
include_once('utils.inc');

	// parse XML file with YMapsML structure into an associative array
	$array = array();
	try {
		$array = XmlParser::parse('xmls_from_ticrk/hostels.xml');
		//var_dump($array);
		//echo $array['collection']['members'][0]['metaDataProperty']['AnyMetaData']['detail_url'];
		//echo json_encode($array);		
	} catch (Exception $e) {
		echo 'Error: ' .  $e->getMessage() . "\n";
	}	
		
	// construct JSON data structure for geo2tag and send it
	$token = $array['request_params']['token'];
	$channel = $array['request_params']['channel'];
	foreach($array['collection']['members'] as $geo_object) {
		$json_data = construct_geo2tag_json($geo_object, $token, $channel);
		if ($json_data) {
			echo $json_data . "\n";
			$response = json_decode(process_request(WRITE_TAG_METHOD_URL, $json_data, 'Content-Type:application/json'), true);
			if ($response) {
				$response_code = check_errors($response['errno']);
				if ($response_code != 'Ok') {
					$name = $geo_object['name'];
					echo "Point with title $name failed to upload: " . 
						$response_code;
					die();
				} 
			}
		}
	}
	echo 'ok';

function construct_geo2tag_json($geo_object, $token, $channel) {
	$data = array();
	$data['auth_token'] = $token;
	$data['channel'] = $channel;
	$data['description'] = $geo_object['description'];
	
	// create geo coordinates
	$geo_coordinates = explode(' ', $geo_object['Point']['pos']);
	$data['latitude'] = floatval($geo_coordinates[0]);
	$data['altitude'] = 0.0;
	$data['longitude'] = floatval($geo_coordinates[1]);
	
	// create link 
	$link = $geo_object['metaDataProperty']['AnyMetaData']['detail_url'];
	if ($link) {
		$data['link'] = $link;
	} else {
		$data['link'] = 'unknown';
	}
	
	// create time slot
	//list($totalSeconds, $extraMilliseconds) = timeAndMilliseconds();	
	$data['time'] = date('d m Y H:i:s') . '.000';
	
	$data['title'] = $geo_object['name'];
	
	return json_encode($data);	
}
	
function timeAndMilliseconds() {
	$m = explode(' ', microtime());
    return array($m[1], (int)round($m[0]*1000,3));
}

function unicodeString($str, $encoding=null) {
    if (is_null($encoding)) $encoding = ini_get('mbstring.internal_encoding');
    return preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/u', function($match) use ($encoding) {
        return mb_convert_encoding(pack('H*', $match[1]), $encoding, 'UTF-16BE');
    }, $str);
}
?>
