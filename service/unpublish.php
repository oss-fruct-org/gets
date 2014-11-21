<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('include/header.inc');

try {
    $dom = get_input_dom('rng-schemes/publish.rng', true);

    $auth_token = get_request_argument($dom, 'auth_token');

    $track_name = get_request_argument($dom, 'track_name');
    $category_id = get_request_argument($dom, 'category_id', null);

    auth_set_token($auth_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);
    require_user_trusted($dbconn);

    if ($category_id) {
        $channel_name = ensure_category_channel($dbconn, $category_id);
    } else {
        $channel_name = $track_name;
        require_channel_owned($dbconn, $channel_name);
    }

    $query = 'DELETE FROM subscribe 
    USING users, channel
    WHERE subscribe.channel_id = channel.id
          AND subscribe.user_id = users.id
          AND channel.name=$1
          AND users.login=$2 RETURNING 1;';

    $result = pg_query_params($dbconn, $query, array($channel_name, GEO2TAG_USER));
    if (!$result) {
        send_error(1, 'Error in DB query');
        die();
    }

    if (pg_num_rows($result) == 0) {
        send_error(1, 'Channel not published');
    } else {
        send_result(0, 'success', "success");
    }

} catch (Exception $ex) {
    send_error($ex->getCode(), $ex->getMessage());
}