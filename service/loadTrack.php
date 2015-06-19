<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('datatypes/point.inc');
include_once('include/channels.inc');

include_once('include/header.inc');

if (ends_with($_SERVER['SCRIPT_FILENAME'], "Track.php")) {
    $type = CHANNEL_TRACK;
} else {
    $type = CHANNEL_POLYGON;
}

try {
    $dom = get_input_dom($type === CHANNEL_TRACK ? 'schemes/loadTrack.xsd' : 'schemes/loadPolygon.xsd');
    
    $auth_token = get_request_argument($dom, 'auth_token');
    
    if ($type === CHANNEL_TRACK) {
        // One of two arguments must be defined
        $channel_name = get_request_argument($dom, 'name');
        $track_id = get_request_argument($dom, 'track_id');
        
        if ($track_id) {
            $channel_name = $track_id;
        }
    } else {
        $channel_name = get_request_argument($dom, "polygon_id");    
    }

    $key = get_request_argument($dom, 'key');

    $xml = load_channel($type, $auth_token, $channel_name, $key);

    send_result(0, 'success', $xml);
} catch (GetsAuthException $e) {
    send_error(1, "Gets authentication error");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
