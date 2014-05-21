<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');

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

if (!$dom->schemaValidate('schemes/subscribedChannels.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token_element = $dom->getElementsByTagName('auth_token');

$data_array = array();
$data_array['auth_token'] = $auth_token_element->item(0)->nodeValue;

$data_json = json_encode($data_array);
if (!$data_json) {
    send_error(1, 'Error: can\'t convert data to json.');
    die();
}

$response_json =  process_request(SUBSCRIBED_CHANNELS_METHOD_URL, $data_json, 'Content-Type:application/json');
if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

$response_code = check_errors($response_array['errno']);
if ($response_code != 'Ok') {
    send_error(1, $response_code);
    die();
}

$content = '<channels>';

foreach ($response_array['channels'] as $channel) {
    $content .= '<channel>';
    $content .= '<name>' . (isset($channel['name']) ? '<![CDATA[' . $channel['name'] . ']]>' : 'unnamed_channel') . '</name>';
    $desc = json_decode($channel['description'], true);
    if (is_null($desc)) {
        $content .= '<description><![CDATA[' . $channel['description'] . ']]></description>';
        $content .= '<category_id>-1</category_id>';
        $content .= '<lang>unknown</lang>';
    } else {
        $content .= '<description>' . (array_key_exists('description', $desc) ? '<![CDATA[' . $desc['description'] . ']]>' : '') . '</description>';
        $content .= '<category_id>' . (array_key_exists('category_id', $desc) ? $desc['category_id'] : '-1') . '</category_id>';
        $content .= '<lang>' . (array_key_exists('lang', $desc) ? $desc['lang'] : 'unknown') . '</lang>';
    }
    $content .= '<url>' . (isset($channel['url']) ? '<![CDATA[' . $channel['url'] . ']]>' : '') . '</url>';
    $content .= '</channel>';
}
$content .= '</channels>';

send_result(0, 'success', $content);
?>

