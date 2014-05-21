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
$category_id = null;
if ($category_name) {
    try {
        $categories = get_categories();

        foreach ($categories as $category) {
            // Category name equals requested name
            if ($category['name'] === $category_name) {
                $category_id = $category['id'];
                break;
            }
        }

        if (!$category_id) {
            send_error(1, "Wrong category name");
            die();
        }
    } catch (Exception $e) {
        send_error(1, $e->getMessage());
        die();
    }
}

function process_subscribed_channels($response_array, $access, &$resp) {
    global $category_id;

    foreach ($response_array['channels'] as $channel) {
        $channel_name = $channel['name'];
        $channel_desc = $channel['description'];
        $channel_url = $channel['url'];

        $channel_description = null;
        $channel_id = null;
        $channel_lang = null;
        $channel_hname = null;

        $desc_arr = json_decode($channel_desc, true);
        if ($desc_arr) {
            $channel_description = get_array_element($desc_arr, 'description');
            $channel_id = get_array_element($desc_arr, 'category_id');
            $channel_lang = get_array_element($desc_arr, 'lang');
            $channel_hname = get_array_element($desc_arr, 'hname');
        }

        if ($channel_id && stripos($channel_name, "tr_") === 0 && ($category_id == null || $category_id == $channel_id)) {
            $resp .= '<track>';
            $resp .= '<name>' . $channel_name . '</name>';

            $resp .= '<description>' . $channel_description . '</description>';
            $resp .= '<category_id>' . $channel_id . '</category_id>';

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
    if ($space === SPACE_PUBLIC || $space === SPACE_ALL) {
        $response_array = process_json_request(SUBSCRIBED_CHANNELS_METHOD_URL, Array(), $public_token);
        process_subscribed_channels($response_array, 'r', $resp);
    }

    if ($space === SPACE_PRIVATE || $space === SPACE_ALL) {
        $response_array = process_json_request(SUBSCRIBED_CHANNELS_METHOD_URL, Array(), $private_token);
        process_subscribed_channels($response_array, 'rw', $resp);
    }
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$resp .= '</tracks>';
send_result(0, 'success', $resp);

?>
