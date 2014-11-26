<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/config.inc');

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

if (!$dom->schemaValidate('schemes/getCategories.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$dbconn = pg_connect(GEO2TAG_DB_STRING);
// Token unused but still check if supplied
try {
    if ($auth_token) {
        auth_set_token($auth_token);
        $private_email = auth_get_google_email();
        $private_email_escaped = pg_escape_string($dbconn, $private_email);
        session_commit();
    }
} catch (GetsAuthException $ex) {
    send_error(1, $ex->getMessage());
    die();
}

$public_login_escaped = pg_escape_string(GEO2TAG_USER);
$query = "SELECT category.id, category.name, category.description, category.url
    FROM category JOIN users ON category.owner_id=users.id
    WHERE users.login='${public_login_escaped}';";
$result = pg_query($dbconn, $query);

$xml = '<categories>';

while ($row = pg_fetch_row($result)) {
    $xml .= '<category>';

    $xml_id = htmlspecialchars($row[0]);
    $xml_name = htmlspecialchars($row[1]);
    $xml_description = htmlspecialchars($row[2]);
    $xml_url = htmlspecialchars($row[3]);

    $xml .= "<id>${xml_id}</id>";
    $xml .= "<name>${xml_name}</name>";
    $xml .= "<description>${xml_description}</description>";
    $xml .= "<url>${xml_url}</url>";

    $xml .= '</category>';
}

$xml .= '</categories>';

send_result(0, 'success', $xml);
?>
