<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/header.inc');

$dbconn = null;

try {
    $dom = get_input_dom('schemes/subscribeTrack.xsd');
    $gets_token = get_request_argument($dom, "auth_token", null);
    $key = get_request_argument($dom, "key", null);

    auth_set_token($gets_token);

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    $user_id = auth_get_db_id($dbconn);

    pg_query($dbconn, "BEGIN;");
    
    $res_update = pg_query_params("UPDATE share SET remain = remain - 1 "
            . "FROM channel "
            . "WHERE channel.id = share.channel_id AND share.key = $1 RETURNING remain, channel.name, channel.id;", array($key));
    
    $res_update_row = pg_fetch_row($res_update);
    if (!$res_update_row) {
        throw new Exception("Key invalid", 1);
    }
    
    $remain = $res_update_row[0];
    $channel_name = $res_update_row[1];
    $channel_id = $res_update_row[2];

    if ($remain == -1) {
        // Old remain value zero
        throw new Exception("Key expired", 2);
    }
    
    $res_subscribe = pg_query_params("INSERT INTO subscribe (user_id, channel_id) VALUES ($1, $2)", array($user_id, $channel_id));
    if (!$res_subscribe) {
        throw new Exception("Channel already subscribed", 3);
    }

    pg_query("COMMIT;");
    
    $channel_name_escaped = htmlspecialchars($channel_name);
    send_result(0, 'success', "<name>$channel_name_escaped</name>");
} catch (Exception $e) {
    if ($dbconn !== null) {
        pg_query("ROLLBACK;");
    }
    send_error($e->getCode(), $e->getMessage());
}
