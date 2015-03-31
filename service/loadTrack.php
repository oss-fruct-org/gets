<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');
include_once('include/auth.inc');
include_once('datatypes/point.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/loadTrack.xsd');
    
    $auth_token = get_request_argument($dom, 'auth_token');
    $channel_name = get_request_argument($dom, 'name');

    if ($auth_token) {
        auth_set_token($auth_token);
    }

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    list($user_id, $channel_id) = require_channel_accessible($dbconn, $channel_name, $auth_token == null);

    $result_tag = pg_query_params($dbconn, 'SELECT time, label, latitude, longitude, altitude, description, url, id FROM tag WHERE tag.channel_id=$1 ORDER BY time;', array($channel_id));

    $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
    $xml .= '<Document>';
    $xml .= '<name>' . $channel_name . '.kml</name>';
    $xml .= '<open>1</open>';
    $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

    // Output points
    while ($row = pg_fetch_row($result_tag)) {
        $point = Point::makeFromPgRow($row);
        $xml .= $point->toKmlPlacemark();
    }

    $xml .= '</Document>';
    $xml .= '</kml>';

    send_result(0, 'success', $xml);
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
    
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
