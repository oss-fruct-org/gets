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

if (!$dom->schemaValidate('schemes/addCategory.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;
$category_name = $dom->getElementsByTagName('name')->item(0)->nodeValue;
$category_description_element = $dom->getElementsByTagName('description');
if ($category_description_element->length > 0) {
    $category_description = $category_description_element->item(0)->nodeValue;
} else {
    $category_description = '{}';
}

$category_url_element = $dom->getElementsByTagName('url');
if ($category_url_element->length > 0) {
    $category_url = $category_url_element->item(0)->nodeValue;
} else {
    $category_url = '{}';
}

auth_set_token($auth_token);
$dbconn = pg_connect(GEO2TAG_DB_STRING);

try {
    $user_id = auth_get_db_id($dbconn);
    $admin_id = require_user_admin($dbconn);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

$result = pg_query_params($dbconn, 'INSERT INTO category (name, description, url, owner_id) VALUES ($1, $2, $3, $4) RETURNING category.id',
    array($category_name, $category_description, $category_url, $admin_id));
$row = pg_fetch_row($result);
$id = $row[0];

$content = '<category>';
$content .= '<id>'.$id.'</id>';
$content .= '<name>'.$category_name.'</name>';
$content .= (isset($category_description) ? '<description>'.$category_description.'</description>' : '');
$content .= (isset($category_url) ? '<url>'.$category_url.'</url>' : '');
$content .= '</category>';

send_result(0, 'success', $content);

include_once('include/php-ga.inc');
?>
