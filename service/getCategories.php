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

$auth_token_element = $dom->getElementsByTagName('auth_token');

$data = '<methodCall><methodName>getCategories</methodName><params><param><struct><member><name>projectName</name><value>'.GEO2TAG_USER.'</value></member></struct></param></params></methodCall>';
$response =  process_request(GETS_SCRIPTS_URL, $data, 'Content-Type: text/xml');
if (!$response) {
	send_error(1, 'Error: problem with request to geo2tag.');
	die();
}

$content = '<categories>';

$dom_response = new DOMDocument();
$dom_response->loadXML($response);

$categories = $dom_response->getElementsByTagName('struct');
foreach ($categories as $category) {
	$members = $category->getElementsByTagName('member');
	$content .= '<category>';
	foreach ($members as $member) {
		$tag_name = $member->getElementsByTagName('name')->item(0)->nodeValue;
		$content .= '<' . $tag_name . '>';
		$content .= $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
		$content .= '</' . $tag_name . '>';
	}
	$content .= '</category>';
}
$content .= '</categories>';

send_result(0, 'success', $content);
?>
