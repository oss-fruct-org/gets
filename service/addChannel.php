<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');

if (!empty($_POST)) {
	$data = json_encode($_POST);
	echo process_request(ADD_CHANNEL_METHOD_URL, $data);
} else {
	echo "Nothing";
}
?>
