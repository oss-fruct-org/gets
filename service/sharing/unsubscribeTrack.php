<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/header.inc');

$dbconn = null;

try {
    $dom = get_input_dom('schemes/unsubscribeTrack.xsd');
    $gets_token = get_request_argument($dom, "auth_token", null);
    $channel_name = get_request_argument($dom, "name", null);

    auth_set_token($gets_token);

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    $user_id = auth_get_db_id($dbconn);

    pg_query($dbconn, "BEGIN;");
    
    $unsubscribe_query = "DELETE FROM subscribe USING channel "
            . "WHERE subscribe.channel_id=channel.id AND subscribe.user_id = $1 AND channel.name=$2 AND subscribe.share_id IS NOT NULL "
            . "RETURNING subscribe.share_id;";
    
    $res_unsubscribe = pg_query_params($dbconn, $unsubscribe_query, array($user_id, $channel_name));
    $res_unsubscribe_count = pg_num_rows($res_unsubscribe);
    
    if ($res_unsubscribe_count === 0) {
        throw new Exception("Track not subscribed", 1);
    }
    
    if ($res_unsubscribe_count > 1) {
        throw new Exception("Server error: more than one subscriptions with given user_id and channel_id", 2);
    }
    
    $res_unsubscribe_row = pg_fetch_row($res_unsubscribe);
    $share_id = $res_unsubscribe_row[0];
    
    $increase_limit_query = "UPDATE share SET remain = remain + 1 WHERE share.id=$1 AND remain >= 0";
    pg_query_params($dbconn, $increase_limit_query, array($share_id));
    
    pg_query("COMMIT;");
    
    send_result(0, 'success', "Unsubscribed successfully");
} catch (Exception $e) {
    if ($dbconn !== null) {
        pg_query("ROLLBACK;");
    }
    send_error($e->getCode(), $e->getMessage());
}
