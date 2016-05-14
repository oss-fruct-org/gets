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

if (!$dom) {
    send_error(1, 'Error: resource isn\'t XML document.');
    die();
}

if (!$dom->schemaValidate('schemes/getUsers.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}


$auth_token = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    $user_id = auth_get_db_id($dbconn);
    $owner_id = require_user_admin($dbconn);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$result = pg_query_params($dbconn, 'SELECT id, login, email, admin_id, user_id FROM "trustedUsers" FULL OUTER JOIN (users FULL OUTER JOIN "adminUsers" ON users.id = "adminUsers".admin_id AND "adminUsers".owner_id = $1) ON "trustedUsers".user_id = id ORDER BY id',
                           array($owner_id));

$xml = '<users>';

while ($row = pg_fetch_row($result)) {
    $xml .= '<user>';

    $xml_id = htmlspecialchars($row[0]);
    $xml_name = htmlspecialchars($row[1]);
    $xml_email = htmlspecialchars($row[2]);
    $xml_admin = htmlspecialchars($row[3]);
    $xml_trusted = htmlspecialchars($row[4]);

    $xml .= "<id>${xml_id}</id>";
    $xml .= "<name>${xml_name}</name>";
    $xml .= "<email>${xml_email}</email>";
    $xml .= "<admin>${xml_admin}</admin>";
    $xml .= "<trusted>${xml_trusted}</trusted>";
    
    $xml .= '</user>';
}

$xml .= '</users>';

send_result(0, 'success', $xml);

include_once('include/php-ga.inc');

?>
