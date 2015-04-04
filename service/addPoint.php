<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('datatypes/point.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/addPoint.xsd');
    $point = Point::makeFromXmlRequest($dom);

    $channel_name = get_request_argument($dom, "channel");
    $category_id = get_request_argument($dom, "category_id");

    $auth_token = get_request_argument($dom, "auth_token");
    auth_set_token($auth_token);

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    if ($category_id) {
        $point->category_id = $category_id;

        require_category($dbconn, $category_id);
        $channel_name = ensure_category_channel($dbconn, $category_id);


        if (!$channel_name) {
            send_error(1, "Request of category's channel failed");
            die();
        }
    }

    list($user_id, $channel_id) = require_channel_owned($dbconn, $channel_name);

    $pg_array = $point->toPgArray($user_id, $channel_id);

    if (!safe_pg_insert($dbconn, 'tag', $pg_array)) {
        send_error(1, 'Can\'t insert point to database');
    } else {
        $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
        $xml .= '<Document>';
        $xml .= '<name>any.kml</name>';
        $xml .= '<open>1</open>';
        $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';
        $xml .= $point->toKmlPlacemark();
        $xml .= '</Document></kml>';

        send_result(0, 'success', $xml);

        include_once('include/php-ga.inc');
    }
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
