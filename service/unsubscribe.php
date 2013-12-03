<?php
include_once('methods_url.php');
include_once('process_request.php');

if (!empty($_POST)) {
	$data = json_encode($_POST);
	echo process_request(UNSUBSCRIBE_METHOD_URL, $data);
} else {
	echo "Nothing";
}
?>