<?php

include_once('methods_url.inc');
include_once('utils.inc');
include_once('auth.inc');

/*
 * Common code for tracks and polygons
 */

define("CHANNEL_TRACK", 1);
define("CHANNEL_POLYGON", 2);



function get_channel_prefix($type) {
    if ($type === 1) {
        return 'tr';
    } else if ($type === 2) {
        return "pl";
    } else {
        throw new Exception('Server error: wrong channel id', 500);
    }
}

/**
 * 
 * @param int $type Type of new channel
 * @param string $auth_token Gets token
 * @param string $description Description of new channel
 * @param string $url Url
 * @param string $name Human readable name of channel
 * @param int $category_id category of channel
 * @param string $lang language in form language[_dialect]
 * @param string $hname human readable name, that is deprecated and overrides $name
 * @param string $photo_url optional url of photo
 * 
 * @return string id of created channel
 */
function create_channel($type, $auth_token, $description, $url, $name, $category_id, $lang, $hname, $photo_url) {
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

    // Generate channel id
    $username = auth_get_db_login($dbconn);
    $channel_id = get_channel_prefix($type) . "+${username}+${name}+${lang}";
    
    $existing_channel_id = get_channel_id($dbconn, $channel_id);
    if ($existing_channel_id) {
        // Foolproof: avoid infinite loop
        for ($i = 0; $i < 10; $i++) {
            $channel_id = get_channel_prefix($type) . "+${username}+${name}+${lang}+" . mt_rand();
            $existing_channel_id = get_channel_id($dbconn, $channel_id);
            if (!$existing_channel_id) {
                break;
            }
        }
    }

    if ($existing_channel_id) {
        throw new Exception("Server error: can't generate channel id", 500);
    }

    $desc_array = array();

    require_category($dbconn, $category_id);

    $desc_array['description'] = $description;
    $desc_array['category_id'] = $category_id;
    $desc_array['lang'] = $lang;
    $desc_array['hname'] = $name;
    if ($photo_url) {
        $desc_array["photo"] = $photo_url;
    }

    $desc_json = unicode_json_encode($desc_array);

    $data_array['description'] = $desc_json;
    $data_array['url'] = $url;
    $data_array['name'] = $channel_id;

    $user_id = auth_get_db_id($dbconn);
    if (!$user_id) {
        throw new Exception('Can\'t get user id by token', 1);
    }

    pg_query("BEGIN;");
    if (!($result_insert = pg_query_params($dbconn, 'INSERT INTO channel (name, description, url, owner_id) VALUES ($1, $2, $3, $4) RETURNING channel.id;', array($channel_id, $desc_json, $url, $user_id)))) {
        throw new Exception('Database error', 500);
    }

    $row = pg_fetch_row($result_insert);
    $result_inserted_id = $row[0];

    if (!pg_query_params($dbconn, 'INSERT INTO subscribe (channel_id, user_id) VALUES ($1, $2);', array($result_inserted_id, $user_id))) {
        throw new Exception('Database error', 500);
    }
    
    pg_query("COMMIT;");
    return $channel_id;
}


/**
 * 
 * @param type $type Type of channel
 * @param type $auth_token Gets token
 * 
 * @param type $channel_name id of track or polygon
 * or
 * @param type $key share key
 * 
 * @return KML string
 */
function load_channel($type, $auth_token, $channel_name, $key) {
    if ($auth_token) {
        auth_set_token($auth_token);
    }

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    if ($channel_name) {
        list($channel_id, $is_owned) = require_channel_accessible($dbconn, $channel_name, $auth_token == null);
        $result_tag = pg_query_params($dbconn, 'SELECT time, label, latitude, longitude, altitude, description, url, id '
                . 'FROM tag WHERE tag.channel_id=$1 ORDER BY time;', array($channel_id));
    } else {
        $is_owned = false;
        $result_tag = pg_query_params($dbconn, 'SELECT DISTINCT '
                . 'tag.time, tag.label, tag.latitude, tag.longitude, tag.altitude, tag.description, tag.url, tag.id '
                . 'FROM channel '
                . 'LEFT JOIN tag ON channel.id = tag.channel_id '
                . 'LEFT JOIN share ON channel.id = share.channel_id '
                . 'WHERE share.key = $1 AND share.remain != 0 ORDER BY time;', array($key));

        if (pg_num_rows($result_tag) === 0) {
            throw new Exception("Key invalid or expired", 1);
        }
    }


    $points_array = array();
    
    // Output points
    while ($row = pg_fetch_row($result_tag)) {
        if ($row[7] === NULL) {
            // Key query returns null string if channel found but has no points
            // and empty set if channel not found
            break;
        }
        $point = Point::makeFromPgRow($row);
        $point->access = $is_owned && $auth_token !== null;
        
        $points_array[] = $point;
    }
    
    
    $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
    $xml .= '<Document>';
    $xml .= '<name>' . $channel_name . '.kml</name>';
    $xml .= '<open>1</open>';
    $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

    foreach ($points_array as $point) {
        $xml .= $point->toKmlPlacemark();
    }

    $xml .= '</Document>';
    $xml .= '</kml>';
    
    return $xml;
}
