<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');

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
        $access_row = "users.email='${private_email_escaped}' AS permission";
    } else {
        $private_email = null;
        $access_row = 'false AS permission';
    }

    if ($space === SPACE_ALL || $space === SPACE_PUBLIC) {
        $email_escaped = pg_escape_string($dbconn, GEO2TAG_EMAIL);
        $email_where_arr[] = "users.email='${email_escaped}'";
    }

    $query = "SELECT DISTINCT ON(tag.id) tag.time, tag.label, tag.latitude, tag.longitude, 
                                      tag.altitude, tag.description, tag.url, tag.id, category.id, ${access_row}, tag.id FROM tag ";
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
        $where_arr[] = "gets_geo_distance(tag.latitude, tag.longitude, ${latitude}, ${longitude}) < ${radius}";
    }

    $query .= 'WHERE ' . implode(' AND ', $where_arr) . ' ORDER BY tag.id ASC, permission DESC;';
    $result = pg_query($dbconn, $query);

    $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
    $xml .= '<Document>';
    $xml .= '<name>any.kml</name>';
    $xml .= '<open>1</open>';
    $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

    // Output points
    while ($row = pg_fetch_row($result)) {
        $datetime = date_postgres_to_gets($row[0]);
        $label = $row[1];
        $latitude = $row[2];
        $longitude = $row[3];
        $altitude = $row[4];
        $description = $row[5];
        $url = $row[6];
        $category_id = $row[8];
        $access = $row[9] == 'f' ? 'r' : 'rw';
        $id = $row[10];

        add_place_mark($xml, $label, $description, $url, $datetime, $latitude, $longitude, $altitude, $id, $access, $category_id);
    }

    $xml .= '</Document></kml>';

    send_result(0, 'success', $xml);
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
