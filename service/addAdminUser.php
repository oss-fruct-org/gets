<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/config.inc');
include_once('include/auth.inc');



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

if (!$dom) {
    send_error(1, 'Error: resource isn\'t XML document.');
    die();
}

$auth_token = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;
$rights = $dom->getElementsByTagName('rights')->item(0)->nodeValue; 
$user_id = $dom->getElementsByTagName('id')->item(0)->nodeValue; 

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    $admin_id = auth_get_db_id($dbconn);
    $owner_id = require_user_admin($dbconn);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

switch ($rights) {
    case "Admin":
        pg_query_params($dbconn, 'INSERT INTO "adminUsers" (admin_id, owner_id) VALUES ($1, $2)',
                                            array($user_id, $owner_id));

        pg_query_params($dbconn, 'DELETE FROM "trustedUsers" WHERE user_id = $1',
                                            array($user_id));
        break;

    case "Trusted":
        pg_query_params($dbconn, 'INSERT INTO "trustedUsers" (user_id, owner_id) VALUES ($1, $2)',
                                            array($user_id, $owner_id));

        pg_query_params($dbconn, 'DELETE FROM "adminUsers" WHERE admin_id = $1',
                                            array($user_id));
        break;

    case "Simple":
        pg_query_params($dbconn, 'DELETE FROM "adminUsers" WHERE admin_id = $1',
                                            array($user_id));

        pg_query_params($dbconn, 'DELETE FROM "trustedUsers" WHERE user_id = $1',
                                            array($user_id));
        break;

    default:
       send_result(10, 'error');
}

send_result(0, 'success');

include_once('include/php-ga.inc');

?>
