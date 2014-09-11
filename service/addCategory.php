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
}
$category_url_element = $dom->getElementsByTagName('url');
if ($category_url_element->length > 0) {
    $category_url = $category_url_element->item(0)->nodeValue;
}

$data = '<methodCall><methodName>addCategory</methodName><params><param><struct><member><name>projectName</name><value>'.GEO2TAG_USER.
	'</value></member><member><name>name</name><value>'. $category_name . '</value></member>'.
	'<member><name>token</name><value>'.$auth_token.'</value></member>'.
	(isset($category_description) ? '<member><name>description</name><value>'.$category_description.'</value></member>' : '').
	(isset($category_url) ? '<member><name>url</name><value>'.$category_url.'</value></member>' : '').'</struct></param></params></methodCall>';
$response =  process_request(GETS_SCRIPTS_URL, $data, 'Content-Type: text/xml');
if (!$response) {
	send_error(1, 'Error: problem with request to geo2tag.');
	die();
}

$dom_response = new DOMDocument();
$dom_response->loadXML($response);
$xpath = new DOMXPath($dom_response);

$success_element = $dom_response->getElementsByTagName('methodResponse');
if ($success_element->length == 0) {
	$xpath_query = "//member[name='faultString']/value/string";
	$errorNode = $xpath->query($xpath_query);
	send_error(1, 'Error: can\'t add new Category: '.$errorNode->item(0)->nodeValue);
	die();
}

$xpath_query = '//methodResponse/params/param/value/string';
$id_element = $xpath->query($xpath_query);
$id = $id_element->item(0)->nodeValue;

$content = '<category>';
$content .= '<id>'.$id.'</id>';
$content .= '<name>'.$category_name.'</name>';
$content .= (isset($category_description) ? '<description>'.$category_description.'</description>' : '');
$content .= (isset($category_url) ? '<url>'.$category_url.'</url>' : '');
$content .= '</category>';
send_result(0, 'success', $content);
?>
