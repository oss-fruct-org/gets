<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/header.inc');

try {
    $dom = get_input_dom('schemes/shareTrack.xsd');
    $gets_token = get_request_argument($dom, "auth_token", null);
    $track_id = get_request_argument($dom, "track_id", null);
    $limit = (int) get_request_argument($dom, "limit", "unlimited");

    if (!check_track_id($track_id)) {
        throw new Exception("Not a track", 1);
    }
    
    auth_set_token($gets_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);
    
    // User must own track. Admin owns all tracks.
    list($user_id, $channel_id) = require_channel_owned($dbconn, $track_id);
    
    // Generate key
    // TODO; check security and uniquiness
    $key = sha1(time() . rand() . $track_id . GOOGLE_SECRET_ID);
    
    // Zero limit argument means no limit
    if ($limit === "unlimited" || $limit <= 0) {
        $limit = -1;
    }
    
    $query = "INSERT INTO share (channel_id, key, remain) VALUES ($1, $2, $3);";
    pg_query_params($dbconn, $query, array($channel_id, $key, $limit));
    
    send_result(0, 'success', "<key>${key}</key>");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
