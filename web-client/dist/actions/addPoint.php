<?php
require_once('utils/process_request.inc');
require_once('utils/constants.inc');
require_once('utils/methods_url.inc');
require_once('utils/array2xml.inc');

header ('Content-Type:text/xml');

session_start();
if (!isset($_SESSION['g2t_token'])) {
    die('<response><status><code>1</code><message>User doesn\'t authorize</message></status></response>');
}

if (filter_input(INPUT_SERVER, 'REQUEST_METHOD') == 'POST') {
    $post_data_json = file_get_contents('php://input');
    $post_data_array = json_decode($post_data_json, true);
    $post_data_array['description'] = json_encode($post_data_array['description'], JSON_UNESCAPED_UNICODE);
    $auth_token_array = array();
    $auth_token_array['auth_token'] = $_SESSION['g2t_token'];
    $combined_array = array_merge($auth_token_array, $post_data_array);        
    $data = array2xml($combined_array, 'params', false);
    echo process_request(WRITE_TAG_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml');   
} else {
    die('<response><status><code>1</code><message>Not POST request</message></status></response>');
}
?>