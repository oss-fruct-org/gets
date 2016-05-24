<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/config.inc');
//include_once('include/auth.inc');


header('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
} else {
    header('Access-Control-Allow-Origin: *');
}

$xml_post = file_get_contents('php://input');
if (!$xml_post) {
    send_error(1, 'Error: no input file');
    die();
}

libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadXML($xml_post);

$params_node = $dom->getElementsByTagName("params")->item(0);    
    $request_array = get_request_array($params_node);

    $auth_token = get_array_element($request_array, 'auth_token');

if (!$dom) {
    send_error(1, 'Error: resource isn\'t XML document.');
    die();
}

if (!$dom->schemaValidate('schemes/updateUserTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    $user_id = auth_get_db_id($dbconn);
    $owner_id = require_user_admin($dbconn);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

    $querySet = "";
    
    $track_id = get_array_element($request_array, 'track_id');

    $url = get_array_element($request_array, 'url');
    !isset($url) ?: $querySet .= "url = '" . $url . "' ,";

    $result = pg_query_params($dbconn, 'SELECT description FROM channel WHERE id = $1',
                           array($track_id));

    $row = pg_fetch_row($result);
    $description_array = json_decode($row[0], true);

    $description = get_array_element($request_array, 'description');
    !isset($description) ?: $description_array['description'] = $description;

    $lang = get_array_element($request_array, 'lang');
    !isset($lang) ?: $description_array['lang'] = $lang;

    $category_id = get_array_element($request_array, 'category_id');
    !isset($category_id) ?: $description_array['category_id'] = $category_id;

    $name = get_array_element($request_array, 'name');
    !isset($name) ?: $description_array['hname'] = $name;

    $querySet .= "description = '" . json_encode($description_array) . "' ,";

    $querySet = rtrim($querySet, ",");

    $queryString = 'UPDATE channel SET ' . $querySet . 'WHERE id = $1';

$result = pg_query_params($dbconn, $queryString,
                           array($track_id));


send_result(0, 'success ', $result);

include_once('include/php-ga.inc');

?>
