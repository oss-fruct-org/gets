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

if (!$dom->schemaValidate('schemes/loadTracks.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$category_name = get_request_argument($dom, 'category_name');

// First request geo2tag for all channels
$old_token = true;
if ($auth_token) {
    $data_array['auth_token'] = $auth_token;
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


// Find id of requested category
if ($category_name) {
    try {
        $categories = get_categories();

        $category_id = null;

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


$data_json = json_encode($data_array);

if (!$data_json) {
    send_error(1, 'Error: can\'t convert data to json.');
    die();
}

$request_type = SUBSCRIBED_CHANNELS_METHOD_URL;
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

$response_code = check_errors($response_array['errno']);
if ($response_code !== "Ok") {
    send_error(1, $response_code);
    die();
}

$resp = '';
$resp .= '<tracks>';
foreach ($response_array['channels'] as $channel) {
    $channel_name = $channel['name'];
    $channel_desc = $channel['description'];
    $channel_url = $channel['url'];

    $channel_description = null;
    $channel_id = null;
    $channel_lang = null;

    $desc_arr = json_decode($channel_desc, true);
    if ($desc_arr) {
        $channel_description = $desc_arr['description'];
        $channel_id = $desc_arr['categoryId'];
        $channel_lang = $desc_arr['lang'];
    }

    if ($channel_id && stripos($channel_name, "tr_") === 0 && ($category_id == null || $category_id == $channel_id)) {
        $resp .= '<track>';
        $resp .= '<name>' . $channel_name . '</name>';

        $resp .= '<description>' . $channel_description . '</description>';
        $resp .= '<category_id>' . $channel_id . '</category_id>';

        if ($channel_lang)
            $resp .= '<lang>' . $channel_lang . '</lang>';

        $resp .= '</track>';
    }
}
$resp .= '</tracks>';

send_result(0, 'success', $resp);

?>
