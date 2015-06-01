<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('datatypes/point.inc');
include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/loadPoints.xsd');
    $gets_token = get_request_argument($dom, "auth_token", null);
 
    $auth_token = get_request_argument($dom, 'auth_token');
    $category_id = get_request_argument($dom, 'category_id');
    $space_arg = get_request_argument($dom, 'space');
    $radius = get_request_argument($dom, 'radius', 0);
    $longitude = get_request_argument($dom, 'longitude', 0);
    $latitude = get_request_argument($dom, 'latitude', 0);

    $is_radius_filter = ($radius !== 0);

    $space = SPACE_ALL;
    if ($space_arg) {
        if ($space_arg === 'public') {
            $space = SPACE_PUBLIC;
        } elseif ($space_arg === 'private') {
            $space = SPACE_PRIVATE;
        }
    }

    if ($space === SPACE_PRIVATE && !$auth_token) {
        send_error(1, 'Private space requires auth_token');
        die();
    }

    if ($space === SPACE_ALL && !$auth_token) {
        $space = SPACE_PUBLIC;
    }

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    // email where query
    $where_arr = array();
    $email_where_arr = array();
    if ($space === SPACE_ALL || $space === SPACE_PRIVATE) {
        try {
            auth_set_token($auth_token);
            $private_email = auth_get_google_email();
            $private_email_escaped = pg_escape_string($dbconn, $private_email);
            session_commit();
        } catch (GetsAuthException $ex) {
            send_error(1, $ex->getMessage());
            die();
        }

        $email_where_arr[] = "users.email='${private_email_escaped}'";
        $access_row = "users.email='${private_email_escaped}'"; 
    } else {
        $private_email = null;
        $access_row = 'false AS permission';
    }

    if ($space === SPACE_ALL || $space === SPACE_PUBLIC) {
        $email_escaped = pg_escape_string($dbconn, GEO2TAG_EMAIL);
        $email_where_arr[] = "users.email='${email_escaped}'";
    }


    // rating and load points query
    $query  = "WITH rating_channels_positive AS (SELECT subscribe.channel_id FROM subscribe INNER JOIN channel ON channel.id=subscribe.channel_id 
                WHERE subscribe.user_id = 91 AND channel.name LIKE 'vote+%+positive'), "; 

    $query .= "rating_channels_negative AS (SELECT subscribe.channel_id FROM subscribe INNER JOIN channel ON channel.id=subscribe.channel_id 
                WHERE subscribe.user_id = 91 AND channel.name LIKE 'vote+%+negative'), ";

    $query .= "rating_tags_positive AS (SELECT tag.id, tag.latitude, tag.longitude, tag.altitude, tag.label FROM tag 
                INNER JOIN rating_channels_positive ON tag.channel_id = rating_channels_positive.channel_id), ";

    $query .= "rating_tags_negative AS (SELECT tag.id, tag.latitude, tag.longitude, tag.altitude, tag.label FROM tag 
                INNER JOIN rating_channels_negative ON tag.channel_id = rating_channels_negative.channel_id), ";
    
    if ($access_row == 'false AS permission') {
        $query .= "response_tags AS (SELECT DISTINCT ON(tag.id) tag.time, tag.label, tag.latitude, tag.longitude, tag.altitude, 
                    tag.description, tag.url, tag.id as tid, category.id as cat FROM tag ";
    } else {
        $query .= "response_tags AS (SELECT DISTINCT ON(tag.id) tag.time, tag.label, tag.latitude, tag.longitude, tag.altitude, 
                    tag.description, tag.url, tag.id as tid, ${access_row} as acc, category.id as cat FROM tag ";
    }

    $query .= 'INNER JOIN channel ON tag.channel_id = channel.id ';
    $query .= 'INNER JOIN subscribe ON channel.id = subscribe.channel_id ';
    $query .= 'INNER JOIN users ON subscribe.user_id=users.id ';
    $query .= 'INNER JOIN category ON safe_cast_to_json(channel.description)->>\'category_id\'=category.id::text ';
    $query .= 'INNER JOIN users AS project_users ON category.owner_id = project_users.id ';
    
    $email_where = '(' . implode(' OR ', $email_where_arr) . ')';
    $where_arr[] = $email_where;
    if ($category_id) {
        $where_arr[] = "category.id=${category_id}";
    } else {
        $where_arr[] = "project_users.login='" . pg_escape_string($dbconn, GEO2TAG_USER) . "'";
    }

    // Distance 'where'
    if ($is_radius_filter) {
        $where_arr[] = " gets_geo_distance(tag.latitude, tag.longitude, ${latitude}, ${longitude}) < ${radius}";
    }

    $query .= 'WHERE ' . implode(' AND ', $where_arr);
    $query .= " AND channel.name NOT LIKE '%+positive' AND channel.name NOT LIKE '%+negative'), ";

    if ($access_row == 'false AS permission') {
        $query .= 'response_tags_positive AS (SELECT response_tags.time, response_tags.label, response_tags.latitude, 
                   response_tags.longitude, response_tags.altitude, response_tags.description, response_tags.url, response_tags.tid, 
                   response_tags.cat, COUNT(rating_tags_positive.latitude) as positive_count FROM rating_tags_positive ';

        $query .= 'RIGHT JOIN response_tags USING (latitude, longitude, altitude) GROUP BY response_tags.latitude, response_tags.longitude,
                   response_tags.altitude, response_tags.label, response_tags.time, response_tags.description, response_tags.url, 
                   response_tags.cat, response_tags.tid), ';
    } else {
        $query .= 'response_tags_positive AS (SELECT response_tags.time, response_tags.label, response_tags.latitude, response_tags.longitude, 
                   response_tags.altitude, response_tags.description, response_tags.url, response_tags.tid, response_tags.acc, response_tags.cat, 
                   COUNT(rating_tags_positive.latitude) as positive_count FROM rating_tags_positive ';
        $query .= 'RIGHT JOIN response_tags USING (latitude, longitude, altitude) GROUP BY response_tags.latitude, response_tags.longitude,
                   response_tags.altitude, response_tags.label, response_tags.time, response_tags.description, response_tags.url, 
                   response_tags.cat, response_tags.acc, response_tags.tid), ';       
    }

    if ($access_row == 'false AS permission') {
        $query .= 'response_tags_negative AS (SELECT response_tags.time, response_tags.label, response_tags.latitude, response_tags.longitude, 
                   response_tags.altitude, response_tags.description, response_tags.url, response_tags.tid, response_tags.cat, 
                   COUNT(rating_tags_negative.latitude) as negative_count FROM rating_tags_negative ';

        $query .= 'RIGHT JOIN response_tags USING (latitude, longitude, altitude) GROUP BY response_tags.latitude, response_tags.longitude,
                   response_tags.altitude, response_tags.label, response_tags.time, response_tags.description, response_tags.url, 
                   response_tags.cat, response_tags.tid) ';
    } else {
        $query .= 'response_tags_negative AS (SELECT response_tags.time, response_tags.label, response_tags.latitude, response_tags.longitude, 
                   response_tags.altitude, response_tags.description, response_tags.url, response_tags.tid, response_tags.acc, response_tags.cat, 
                   COUNT(rating_tags_negative.latitude) as negative_count FROM rating_tags_negative ';
        $query .= 'RIGHT JOIN response_tags USING (latitude, longitude, altitude) GROUP BY response_tags.latitude, response_tags.longitude,
                    response_tags.altitude, response_tags.label, response_tags.time, response_tags.description, response_tags.url, 
                    response_tags.cat, response_tags.acc, response_tags.tid) ';
    }

    if ($access_row == 'false AS permission') {
        $query .= 'SELECT response_tags_positive.time, response_tags_positive.label, response_tags_positive.latitude, response_tags_positive.longitude, 
                    response_tags_positive.altitude, response_tags_positive.description, response_tags_positive.url, response_tags_positive.tid,
                    response_tags_positive.positive_count, response_tags_negative.negative_count, response_tags_positive.cat
                    FROM response_tags_positive INNER JOIN response_tags_negative USING (latitude, longitude)';  
    } else {
        $query .= 'SELECT response_tags_positive.time, response_tags_positive.label, response_tags_positive.latitude, response_tags_positive.longitude, 
                    response_tags_positive.altitude, response_tags_positive.description, response_tags_positive.url, response_tags_positive.tid,
                    response_tags_positive.positive_count, response_tags_negative.negative_count, response_tags_positive.cat, response_tags_positive.acc
                    FROM response_tags_positive INNER JOIN response_tags_negative USING (latitude, longitude)';  
    }

    $result = pg_query($dbconn, $query);

    $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
    $xml .= '<Document>';
    $xml .= '<name>any.kml</name>';
    $xml .= '<open>1</open>';
    $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

    // Output points
    while ($row = pg_fetch_row($result)) {
        $point = Point::makeFromPgRow($row);
        $xml .= $point->toKmlPlacemark();
    }

    $xml .= '</Document></kml>';

    send_result(0, 'success', $xml);

    //include_once('include/php-ga.inc');
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
?>