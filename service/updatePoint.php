<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('datatypes/point.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/updatePoint.xsd');
    $params_node = $dom->getElementsByTagName("params")->item(0);
    
    $request_array = get_request_array($params_node);
    $auth_token = get_array_element($request_array, 'auth_token');
    $uuid = get_array_element($request_array, 'uuid');
    $channel_name = get_array_element($request_array, 'channel');
    $point_name = get_array_element($request_array, 'name');
    $point_category = get_array_element($request_array, 'category_id');
    
    if (!$uuid && !$channel_name && !$point_name && !$point_category) {
        send_error(1, 'No filter criteria specified');
        die();
    }
    
    // Point containing new fields
    $new_point = Point::makeFromXmlRequest($dom);
    
    auth_set_token($auth_token);
    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    $email = auth_get_google_email();
    $email_escaped = pg_escape_string($dbconn, $email);

    $where_arr = array('TRUE');

    // Point name condition
    if ($point_name) {
        $point_name_escaped = pg_escape_string($dbconn, $point_name);
        $where_arr[] = "tag.label='${point_name}'";
    }

    // Point category condition
    if ($point_category) {
        $point_category_escaped = pg_escape_string($dbconn, $point_category);
        $where_arr[] = "safe_cast_to_json(tag.description)->>'category_id'='${point_category_escaped}'";
    }

    // UUID condition
    if ($uuid) {
        $uuid_escaped = pg_escape_string($dbconn, $uuid);
        $where_arr[] = "safe_cast_to_json(tag.description)->>'uuid'='${uuid_escaped}'";
    }

    // Channel name condition
    if ($channel_name) {
        $channel_name_escaped = pg_escape_string($dbconn, $channel_name);
        $where_arr[] = "channel.name='${channel_name_escaped}'";
    }

    // User account condition
    $where_arr[] = "users.email='${email_escaped}'";
    $select_where = implode(' AND ', $where_arr);

    $select_query = "SELECT tag.time, tag.label, tag.latitude, tag.longitude, tag.altitude, tag.description, tag.url, tag.id FROM tag
        INNER JOIN channel ON tag.channel_id=channel.id 
        INNER JOIN users ON channel.owner_id=users.id 
        WHERE ${select_where}";
    
    $select_res = pg_query($dbconn, $select_query);
    
    while ($row = pg_fetch_row($select_res)) {
        $existing_point = Point::makeFromPgRow($row);
        $existing_point->merge($new_point);
        $id = $row[7];
        
        $updated_point_array = $existing_point->toPgArray(null, null);
        safe_pg_update($dbconn, "tag", $updated_point_array, array("id" => $id));
    }
    send_result(0, "Points successfully updated", pg_num_rows($select_res));
} catch (GetsAuthException $e) {
    send_error(1, "Can't login in google");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
