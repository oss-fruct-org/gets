<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/geo2tag_errors_list.inc');
include_once('include/auth.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/updateTrack.xsd');

    $auth_token = get_request_argument($dom, 'auth_token');
    $track_id = get_request_argument($dom, 'auth_token');
    
    $description = get_request_argument($dom, 'description');
    $url = get_request_argument($dom, 'url');
    $name = get_request_argument($dom, 'name');
    $category_id = (int) get_request_argument($dom, 'category_id');
    $lang = get_request_argument($dom, 'lang');
    $photo_url = get_request_argument($dom, 'photoUrl');

    auth_set_token($auth_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    list($user_id, $channel_id) = require_channel_owned($dbconn, $track_id);
    
    $res = pg_query_params($dbconn, "SELECT channel.name, channel.description, channel.url FROM channel WHERE channel.id = $1;",
            array($channel_id));

    $row = pg_fetch_row($res);
    
    if (!$row) {
        throw new Exception("Channel does not exists", 1);
    }
    
    list($old_name, $old_description, $old_url) = $row;
    
    $old_desc_array = json_decode($old_description, true);
    if (!$old_desc_array) {
        $old_desc_array = array();
        $old_desc_array["description"] = $old_description;
    }
    
    // Existing database workaround
    if ($old_url === "{}") {
        $old_url = "";
    }
    
    if ($description) {
        $old_desc_array["description"] = $description;
    }
    
    if ($url) {
        $old_url = $url;
    }
    
    if ($name) {
        $old_desc_array["hname"] = $name;
    }
    
    if ($category_id) {
        require_category($dbconn, $category_id);
        $old_desc_array["category_id"] = $category_id;
    }
    
    if ($lang) {
        $old_desc_array["lang"] = $lang;
    }
    
    if ($photo_url) {
        $old_desc_array["photo"] = $photo_url;
    }
    
    $new_description = unicode_json_encode($old_desc_array);
    
    $result = pg_query_params("UPDATE channel SET description=$1, url=$2 WHERE channel.id = $3;", array($new_description, $old_url));
    if (!$result) {
        throw new Exception("Database error", 1);
    }
    
    send_result(0, 'success', $response);
} catch (GetsAuthException $e) {
    send_error(1, "Google login error");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
