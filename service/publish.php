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
    $polygon_name = get_request_argument($dom, 'polygon_name', null);

    auth_set_token($auth_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);
    require_user_trusted($dbconn);

    if ($category_id) {
        $channel_name = ensure_category_channel($dbconn, $category_id);
    } else if ($track_name) {
        $channel_name = $track_name;
        require_channel_owned($dbconn, $channel_name);
    } else {
        $channel_name = $polygon_name;
        require_channel_owned($dbconn, $channel_name);
    }

    $query = 'INSERT INTO subscribe (channel_id, user_id)
    SELECT channel.id as ins_channel_id, users.id as ins_user_id
    FROM channel CROSS JOIN users
    WHERE channel.name=$1
          AND users.login=$2
          AND NOT EXISTS (
            SELECT subscribe.channel_id from subscribe
            INNER JOIN users ON users.id = subscribe.user_id
            INNER JOIN channel ON channel.id = subscribe.channel_id
            WHERE users.login=$2
                AND channel.name=$1
          )
          RETURNING 1;';

    $result = pg_query_params($dbconn, $query, array($channel_name, GEO2TAG_USER));
    if (!$result) {
        send_error(1, 'Error in DB query');
        die();
    }

    if (pg_num_rows($result) == 0) {
        send_error(2, 'Channel already published');
    } else {
        send_result(0, 'success', "success");
    }

} catch (Exception $ex) {
    send_error($ex->getCode(), $ex->getMessage());
}

include_once('include/php-ga.inc');

?>
