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

if (!$dom->schemaValidate('schemes/updateUserPoint.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
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
    
    $tag_id = get_array_element($request_array, 'point_id');

    $name = get_array_element($request_array, 'name');
    !isset($name) ?: $querySet .= "label = '" . $name . "' ,";

    $latitude = get_array_element($request_array, 'latitude');
    !isset($latitude) ?: $querySet .= "latitude = '" . $latitude . "' ,";

    $longitude = get_array_element($request_array, 'longitude');
    !isset($longitude) ?: $querySet .= "longitude = '" . $longitude . "' ,";

    $result = pg_query_params($dbconn, 'SELECT description, url FROM tag WHERE id = $1',
                           array($tag_id));

    $row = pg_fetch_row($result);
    $description_array = json_decode($row[0], true);
    $url_array = json_decode($row[1], true);

    $description = get_array_element($request_array, 'description');
    !isset($description) ?: $description_array['description'] = $description;

    $uuid = get_array_element($request_array, 'uuid');
    !isset($uuid) ?: $description_array['uuid'] = $uuid;

    $category_id = get_array_element($request_array, 'category_id');
    !isset($category_id) ?: $description_array['category_id'] = $category_id;

    $radius = get_array_element($request_array, 'radius');
    !isset($radius) ?: $description_array['radius'] = $radius;

    //TODO: additionalinput

    $querySet .= "description = '" . json_encode($description_array) . "' ,";

    $url = get_array_element($request_array, 'url');
    !isset($url) ?: $url_array['link'] = $url;

    $audio = get_array_element($request_array, 'audio_track_url');
    !isset($audio) ?: $url_array['audio'] = $audio;

    $snaps = $dom->getElementsByTagName("snap");    

    if(isset($snaps)){
        $snapsArray = array();
        foreach ($snaps as $snap) {
            $snapsArray[] = $snap ->nodeValue;          
        }
        $url_array['photo'] =  $snapsArray;
    }
   // $snaps = $category_id = get_array_element($request_array, 'snaps');
 /*   if(isset($snaps)){
        $snapsArray = array();
        foreach ($snaps as $snap) {
            $snapsArray[] = $snap;          
        }
        $url_array['photo'] =  $snapsArray;
    }*/

    $querySet .= "url = '" . json_encode($url_array) . "' ,";

    $querySet = rtrim($querySet, ",");

    $queryString = 'UPDATE tag SET ' . $querySet . 'WHERE id = $1';

$result = pg_query_params($dbconn, $queryString,
                           array($tag_id));


send_result(0, 'success ', $result);

include_once('include/php-ga.inc');

?>
