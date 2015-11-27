<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/header.inc');

try {
    $dom = get_input_dom('schemes/unshareTrack.xsd');
    
    $gets_token = get_request_argument($dom, "auth_token", null);
    $key = get_request_argument($dom, "key", null);

    auth_set_token($gets_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    if (!check_key_owned($dbconn, $key)) {
        throw new Exception("Invalid key", 1);
    }
    
    // All subscriptions will be also deleted (ON DELETE CASCADE)
    $query = "DELETE FROM share WHERE key=$1;";
    pg_query_params($dbconn, $query, array($key));

    send_result(0, 'success', "Share deleted");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
