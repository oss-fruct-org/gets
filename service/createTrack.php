<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/geo2tag_errors_list.inc');
include_once('include/auth.inc');

include_once('include/header.inc');

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
    $photoUrl = get_request_argument($dom, 'photoUrl');

    if (!$description) {
        $description = "";
    }
    
    if (!$url) {
        $url = "";
    }
    
    if (!$lang) {
        $lang = 'ru_RU';
    }

    // Compatibility with clients that pass -1 assuming "null category"
    if ($category_id === -1) {
        $category_id = DEFAULT_CATEGORY_ID;
    }

    // hname deprecated, but processed instead of name
    if ($hname) {
        $name = $hname;
    }


    auth_set_token($auth_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    // Compatibility with old clients that pass track name in format "tr_"
    $prefix = check_track_id($name);
    if ($prefix === 'tr_' || $prefix === 'tr+') {
        $track_id = $name;
    } else {
        $username = auth_get_db_login($dbconn);
        $track_id = "tr+${username}+${name}+${lang}";
    }

    $desc_array = array();
    
    require_category($dbconn, $category_id);

    $desc_array['description'] = $description;
    $desc_array['category_id'] = $category_id;
    $desc_array['lang'] = $lang;
    $desc_array['hname'] = $name;
    if ($photoUrl) {
        $desc_array["photo"] = $photoUrl;
    }

    $desc_json = unicode_json_encode($desc_array);

    $data_array['description'] = $desc_json;
    $data_array['url'] = $url;
    $data_array['name'] = $track_id;

    $user_id = auth_get_db_id($dbconn);
    
    $existing_channel_id = get_channel_id($dbconn, $track_id);
    if ($existing_channel_id) {
        // Foolproof: avoid infinite loop
        for ($i = 0; $i < 10; $i++) {
            $track_id = "tr+${username}+${name}+${lang}+" . mt_rand();
            $existing_channel_id = get_channel_id($dbconn, $track_id);
            if (!$existing_channel_id) {
                break;
            }
        }
    }
    
    if ($existing_channel_id) {
        throw new Exception("Server error: can't generate track id", 1);
    }

    if (!$user_id) {
        throw new Exception('Can\'t get user id by token', 1);
    }

    pg_query("BEGIN;");
    if (!($result_insert = pg_query_params($dbconn, 'INSERT INTO channel (name, description, url, owner_id) VALUES ($1, $2, $3, $4) RETURNING channel.id;',
            array($track_id, $desc_json, $url, $user_id)))) {
        throw new Exception('Database error', 1);
    }

    $row = pg_fetch_row($result_insert);
    $result_inserted_id = $row[0];

    if (!pg_query_params($dbconn, 'INSERT INTO subscribe (channel_id, user_id) VALUES ($1, $2);', array($result_inserted_id, $user_id))) {
        throw new Exception('Database error', 1);
    }

    $response = "<track_id>" .  htmlspecialchars($track_id) . "</track_id>";
    
    pg_query("COMMIT;");
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
