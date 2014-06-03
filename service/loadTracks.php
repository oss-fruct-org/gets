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

if (!$dom->schemaValidate('schemes/loadTracks.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$category_name = get_request_argument($dom, 'category_name');
$space_arg = get_request_argument($dom, 'space');

$radius = get_request_argument($dom, 'radius', 0);
$longitude = get_request_argument($dom, 'longitude', 0);
$latitude = get_request_argument($dom, 'latitude', 0);

$is_radius_filter = ($radius !== 0);

$space = SPACE_ALL;
if ($space_arg) {
    if ($space_arg === 'public') {
        $space = SPACE_PUBLIC;
    } elseif ($space_arg === 'private') {
        $space = SPACE_PRIVATE;
    }
}

if ($space === SPACE_PRIVATE && !$auth_token) {
    send_error(1, 'Private space requires auth_token');
    die();
}

if ($space === SPACE_ALL && !$auth_token) {
    $space = SPACE_PUBLIC;
}

$private_token = $auth_token;
$public_token = null;

if ($space === SPACE_ALL || $space === SPACE_PUBLIC) {
    $public_token = read_public_token();

    // No token available, trying to receive it from geo2tag server
    if (!$public_token) {
        $public_token = receive_public_token();
        if (!$public_token) {
            send_error(1, 'Error: can\'t receive new token');
            die();
        }
    }
}

// Find id of requested category
$requested_category_id = null;
if ($category_name) {
    try {
        $categories = get_categories();

        foreach ($categories as $category) {
            // Category name equals requested name
            if ($category['name'] === $category_name) {
                $requested_category_id = $category['id'];
                break;
            }
        }

        if (!$requested_category_id) {
            send_error(1, "Wrong category name");
            die();
        }
    } catch (Exception $e) {
        send_error(1, $e->getMessage());
        die();
    }
}

function process_subscribed_channels($response_array, $access, &$resp) {
    global $requested_category_id;

    foreach ($response_array['channels'] as $channel) {
        if (isset($channel['channel'])) {
            $channel = $channel['channel'];
        }

        $channel_name = $channel['name'];
        $channel_desc = get_array_element($channel, 'description', '');;
        $channel_url = get_array_element($channel, 'url', '');;

        $channel_description = null;
        $channel_category_id = null;
        $channel_lang = null;
        $channel_hname = null;

        $desc_arr = json_decode($channel_desc, true);
        if ($desc_arr) {
            $channel_description = get_array_element($desc_arr, 'description');
            $channel_category_id = get_array_element($desc_arr, 'category_id');
            $channel_lang = get_array_element($desc_arr, 'lang');
            $channel_hname = get_array_element($desc_arr, 'hname');
        }

        if (stripos($channel_name, "tr_") === 0 
                && ($requested_category_id === null || $requested_category_id === $channel_category_id)) {
            $resp .= '<track>';
            $resp .= '<name>' . $channel_name . '</name>';

            $resp .= '<description>' . $channel_description . '</description>';
            $resp .= '<category_id>' . $channel_category_id . '</category_id>';

            if ($channel_lang)
                $resp .= '<lang>' . $channel_lang . '</lang>';

            if ($channel_hname)
                $resp .= '<hname>' . $channel_hname . '</hname>';

            $resp .= '<access>' . $access . '</access>';

            $resp .= '</track>';
        }
    }
}

$resp = '<tracks>';

try {
    $method = SUBSCRIBED_CHANNELS_METHOD_URL;
    $request_array = Array();

    if ($is_radius_filter) {
        $method = FILTER_CIRCLE_METHOD_URL;
        $request_array = Array('radius' => $radius, 'latitude' => $latitude, 'longitude' => $longitude, 'time_from' => '01 01 1999 00:00:00.000',
                'time_to' => '01 01 2199 00:00:00.000');
    }

    if ($space === SPACE_PUBLIC || $space === SPACE_ALL) {
        $response_array = process_json_request($method, $request_array, $public_token);
        process_subscribed_channels($response_array, 'r', $resp);
    }

    if ($space === SPACE_PRIVATE || $space === SPACE_ALL) {
        $response_array = process_json_request($method, $request_array, $private_token);
        process_subscribed_channels($response_array, 'rw', $resp);
    }

    /* else {
        if ($space === SPACE_PUBLIC || $space === SPACE_ALL) {
            $response_array = process_json_request(FILTER_CIRCLE_METHOD_URL, 
                    Array('radius' => $radius, 'latitude' => $latitude, 'longitude' => $longitude), $public_token);
            process_channels_in_radius($response_array, 'r', $resp);
        }

        if ($space === SPACE_PUBLIC || $space === SPACE_ALL) {
            $response_array = process_json_request(FILTER_CIRCLE_METHOD_URL, 
                    Array('radius' => $radius, 'latitude' => $latitude, 'longitude' => $longitude), $private_token);
            process_channels_in_radius($response_array, 'r', $resp);
        }
    }*/
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    invalidate_public_token();
    die();
}

$resp .= '</tracks>';
send_result(0, 'success', $resp);

?>
