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

$data_array['auth_token'] = $_SESSION['g2t_token'];
$data = array2xml($data_array['auth_token'], 'params', false);
echo process_request(GET_USER_INFO, '<request>' . $data . '</request>', 'Content-Type: text/xml');
?>