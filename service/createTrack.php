<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/geo2tag_errors_list.inc');
include_once('include/auth.inc');
include_once('include/channels.inc');

include_once('include/header.inc');

if (ends_with($_SERVER['SCRIPT_FILENAME'], "Track.php")) {
    $type = CHANNEL_TRACK;
} else {
    $type = CHANNEL_POLYGON;
}

try {
    $dom = get_input_dom('schemes/createTrack.xsd');

    if (!defined('DEFAULT_CATEGORY_ID')) {
        send_error(1, 'Server misconfigured: DEFAULT_CATEGORY_ID undefined');
        die();
    }

    $data_array = array();
    $auth_token = get_request_argument($dom, 'auth_token');
    $description = get_request_argument($dom, 'description');
    $url = get_request_argument($dom, 'url');
    $name = get_request_argument($dom, 'name');
    $category_id = (int) get_request_argument($dom, 'category_id', DEFAULT_CATEGORY_ID);
    $lang = get_request_argument($dom, 'lang');
    $hname = get_request_argument($dom, 'hname');
    $photo_url = get_request_argument($dom, 'photoUrl');

    $channel_id = create_channel($type, $auth_token, $description, $url, $name, $category_id, $lang, $hname, $photo_url);

    if ($type === CHANNEL_TRACK) {
        $response = "<track_id>" .  htmlspecialchars($channel_id) . "</track_id>";
    } else {
        $response = "<polygon_id>" . htmlspecialchars($channel_id) . "</polygon_id>";
    }
    send_result(0, 'success', $response);
} catch (GetsAuthException $e) {
    if ($dbconn) {
        pg_query($dbconn, "ROLLBACK;");
    }
    send_error(1, "Google login error");
} catch (Exception $e) {
    if ($dbconn) {
        pg_query($dbconn, "ROLLBACK;");
    }
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
