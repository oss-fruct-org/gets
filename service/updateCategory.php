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

if (!$dom->schemaValidate('schemes/updateCategory.xsd')) {
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
    
    $id = get_array_element($request_array, 'id');

    $name = get_array_element($request_array, 'name');
    !isset($name) ?: $querySet .= "name = '" . $name . "' ,";

    $description = get_array_element($request_array, 'description');
    !isset($description) ?: $querySet .= "description = '" . $description . "' ,";

    $url = get_array_element($request_array, 'url');
    !isset($url) ?: $querySet .= "url = '" . $url . "' ,";
  
    $querySet = rtrim($querySet, ",");

    $queryString = 'UPDATE category SET ' . $querySet . 'WHERE id = $1';

$result = pg_query_params($dbconn, $queryString,
                           array($id));

send_result(0, 'success ', $result);

include_once('include/php-ga.inc');

?>
