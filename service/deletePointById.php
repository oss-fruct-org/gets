<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/deletePointById.xsd');

    $auth_token = get_request_argument($dom, 'auth_token');

    $point_id = get_request_argument($dom, 'id');

    $dbconn = pg_connect(GEO2TAG_DB_STRING);
    auth_set_token($auth_token);

    $email = auth_get_google_email();

    $user_is_admin = (is_user_admin($dbconn) > 0 ? true : false);

    // admin user not required to check email
    if ($user_is_admin) {
        if(isset($point_id)){
            
            $query = "DELETE FROM tag
                WHERE id=$1 RETURNING channel_id;";

            $res = pg_query_params($dbconn, $query, array($point_id));
        } 
    
        /*$query = "DELETE FROM channel WHERE channel.id = $1
            RETURNING channel.id;";*/

        $res2 = pg_query_params($dbconn, $query, array($res));
    }

    $count = pg_num_rows($res);

    if ($count == 0) {
        send_error(1, "Point not found");
    } else {
        send_result(0, "Point successfully removed");
    }
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
