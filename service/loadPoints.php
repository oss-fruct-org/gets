<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');

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

if (!$dom->schemaValidate('schemes/loadPoints.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');
$category_id_element = $dom->getElementsByTagName('category_id');
$latitude_element = $dom->getElementsByTagName('latitude');
$longitude_element = $dom->getElementsByTagName('longitude');
$radius_element = $dom->getElementsByTagName('radius');
$space_element = $dom->getElementsByTagName('space');

$is_auth_token_defined = $auth_token_element->length > 0;
$category_condition = $category_id_element->length > 0;
$location_condition = ($latitude_element->length > 0) && 
                    ($longitude_element->length > 0) && 
                    ($radius_element->length > 0);
$space_condition = $space_element->length > 0;

					   
$category_id = $category_condition ? 
                htmlspecialchars($category_id_element->item(0)->nodeValue) : 
		-1;

// for different spaces we use different tokens
$token_public = NULL;
$token_user = NULL;

// check what is space condition, by default it is 'all'
$space = SPACE_ALL;
if ($space_condition) {
    $space_string = htmlspecialchars($space_element->item(0)->nodeValue);
    if ($space_string === 'public') {
        $space = SPACE_PUBLIC;
    } elseif ($space_string === 'private') {
        $space = SPACE_PRIVATE;
    }
}

// if there is no token in a request, 
// then only public data will be sent in a response
if (!$is_auth_token_defined) {
    $space = SPACE_PUBLIC;
}

// We use cached token, not new
//$old_token = true;
if ($is_auth_token_defined) {
    $token_user = $auth_token_element->item(0)->nodeValue; 
    //$old_token = false;
}

if (!($is_auth_token_defined && ($space === SPACE_PRIVATE))) {
    $token_public = read_public_token();
    // No token available, trying to receive it from geo2tag server
    if (!$token_public) {
        $token_public = receive_public_token();
        //$old_token = false;

        if (!$token_public) {
            send_error(1, 'Error: can\'t receive new token');
            die();
        }
    }
}

function getChannelsAsDom($token) {
    $subs_channels_request_content = '<request><params><auth_token>' . $token . '</auth_token></params></request>';
    
    $subs_channels_response = process_request(SUBSCRIBED_CHANNELS_METHOD_URL_GETS, 
                                            $subs_channels_request_content, 
                                            'Content-Type: text/xml');
    
    if (!$subs_channels_response) {
        send_error(1, 'Error: internal server error');
        die();
    }
    
    $subs_channels_response_dom = new DOMDocument();
    $subs_channels_response_dom->loadXML($subs_channels_response);
    if (!$subs_channels_response_dom) {
        send_error(1, 'Error: internal server error');
        die();
    }
    
    return $subs_channels_response_dom;
}

function getChannelNames(&$token, $category_id) {  
    $channels_name_array = array();
    
    $subs_channels_response_dom = getChannelsAsDom($token);
       
    if ($subs_channels_response_dom->getElementsByTagName('code')->item(0)->nodeValue != 0) {
        $response_code = check_errors($subs_channels_response_dom->getElementsByTagName('code')->item(0)->nodeValue);

        // Geo2tag server requires authentication and we're using cached token
        if ($response_code === 'Wrong token error') {
            // Try receive new token from server
            $token = receive_public_token();
            if (!$token) {
                send_error(1, 'Error: can\'t receive new token');
                die();
            }

            $subs_channels_response_dom = getChannelsAsDom($token);
            $response_code = check_errors($subs_channels_response_dom->getElementsByTagName('code')->item(0)->nodeValue);

            // Same error, new token invalid
            if ($response_code === 'Wrong token error') {
                send_error(1, 'Error: geo2tag server returned invalid token');
                die();
            }
        }
        send_error(1, 'Error: internal server error');
        die();
    }

    $channels_elements = $subs_channels_response_dom->getElementsByTagName('channel');
    foreach($channels_elements as $channel) {
        if ($category_id == $channel->getElementsByTagName('category_id')->item(0)->nodeValue) {
            $channels_name_array[] = $channel->getElementsByTagName('name')->item(0)->nodeValue;
        }
    }
 
    return $channels_name_array;
}

function addItemIntoXml($item, &$xml) {
    $xml .= '<Placemark>';
    $xml .= '<name><![CDATA[' . $item['title'] . ']]></name>';
    $xml .= '<description><![CDATA[' .  $item['description'] . ']]></description>';
    $xml .= '<ExtendedData><Data name="url"><value><![CDATA[' . $item['link'] . ']]></value></Data></ExtendedData>';
    $xml .= '<Point><coordinates>' . $item['latitude'] . ',' . $item['longitude'] . ',0.0' . '</coordinates></Point>';
    $xml .= '</Placemark>';
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

    $response_array = json_decode($response_json, true);
    if (!$response_array) {
        send_error(1, 'Error: can\'t decode data from geo2tag.');
        die();
    }

    return $response_array;
}

$is_wrong_token_error = false;

function getData($data_array, $request_type, &$xml, $location_condition, &$is_wrong_token_error) {
    $response_array = process_load_points_request($data_array, $request_type);
    $response_code = check_errors($response_array['errno']);
    
    // Geo2tag server requires authentication and we're using cached token
    if ($response_code === 'Wrong token error') {
        $is_wrong_token_error = true;
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

    if ($location_condition) {
        foreach($response_array['channels'] as $channel) {
            foreach($channel['channel']['items'] as $item) {
                addItemIntoXml($item, $xml);
            }
        }
    } else {
        foreach($response_array['channel']['items'] as $item) {
            addItemIntoXml($item, $xml);
        }	
    }
}

function makeRequestBasedOnConditions(&$xml, $category_condition, $location_condition, 
        $channels_name_array, $latitude_element, $longitude_element, $radius_element, $is_wrong_token_error, $token) {
    
    $data_array = array();
    $data_array['auth_token'] = $token;

    $request_type = '';
    if ($category_condition && $location_condition) {
        $data_array['latitude'] = floatval($latitude_element->item(0)->nodeValue);
        $data_array['longitude'] = floatval($longitude_element->item(0)->nodeValue);
        $data_array['radius'] = floatval($radius_element->item(0)->nodeValue);
        $data_array['time_from'] = '01 01 1999 00:00:00.000';
        $data_array['time_to'] = '01 01 2099 00:00:00.000';
        $request_type = LOAD_POINTS_METHOD_URL;
        foreach ($channels_name_array as $channel_name) {
            $data_array['channel'] = $channel_name;
            getData($data_array, $request_type, $xml, $location_condition, $is_wrong_token_error);
        }
    } else if ($category_condition) {
        $data_array['amount'] = 10000;
        $request_type = FILTER_CHANNEL_METHOD_URL;
        foreach ($channels_name_array as $channel_name) {
            $data_array['channel'] = $channel_name;
            getData($data_array, $request_type, $xml, $location_condition, $is_wrong_token_error);
        }
    } else {
        $data_array['latitude'] = floatval($latitude_element->item(0)->nodeValue);
        $data_array['longitude'] = floatval($longitude_element->item(0)->nodeValue);
        $data_array['radius'] = floatval($radius_element->item(0)->nodeValue);
        $data_array['time_from'] = '01 01 1999 00:00:00.000';
        $data_array['time_to'] = '01 01 2099 00:00:00.000';
        $request_type = LOAD_POINTS_METHOD_URL;
        getData($data_array, $request_type, $xml, $location_condition, $is_wrong_token_error);
    }
}


$channels_name_array_public = array();
$channels_name_array_user = array();
if ($category_id != -1) {
    if ($space === SPACE_ALL) {
        $channels_name_array_public = getChannelNames($token_public, $category_id);
        $channels_name_array_user = getChannelNames($token_user, $category_id);
    } elseif ($space === SPACE_PUBLIC) {
        $channels_name_array_public = getChannelNames($token_public, $category_id);
    } elseif ($space === SPACE_PRIVATE) {
        $channels_name_array_user = getChannelNames($token_user, $category_id);
    }
    
    if (!(count($channels_name_array_public) > 0) && !(count($channels_name_array_user))) {
        send_error(1, 'Error: there is no category in the system with given id');
        die();
    }
}


$xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
$xml .= '<Document>';
$xml .= '<name>any.kml</name>';
$xml .= '<open>1</open>';
$xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

// make requests based on different spaces
if ($space === SPACE_ALL) {
    makeRequestBasedOnConditions($xml, $category_condition, $location_condition, 
                                $channels_name_array_public, $latitude_element, 
                                $longitude_element, $radius_element, 
                                $is_wrong_token_error, $token_public);
    makeRequestBasedOnConditions($xml, $category_condition, $location_condition, 
                               $channels_name_array_user, $latitude_element, 
                                $longitude_element, $radius_element, 
                                $is_wrong_token_error, $token_user);
} elseif ($space === SPACE_PUBLIC) {
    makeRequestBasedOnConditions($xml, $category_condition, $location_condition, 
                                $channels_name_array_public, $latitude_element, 
                                $longitude_element, $radius_element, 
                                $is_wrong_token_error, $token_public);
} elseif ($space === SPACE_PRIVATE) {
    makeRequestBasedOnConditions($xml, $category_condition, $location_condition, 
                                $channels_name_array_user, $latitude_element, 
                                $longitude_element, $radius_element, 
                                $is_wrong_token_error, $token_user);
}

$xml .= '</Document>';
$xml .= '</kml>';

if ($is_wrong_token_error && $is_auth_token_defined) {
    send_result(2, 'Wrong token error. Response contains only public data.', $xml);
} else {
    send_result(0, 'success', $xml);
}
?>
