<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');

if (!empty($_POST)) {
	$data = json_encode($_POST);
	echo process_request(AVAILABLE_CHANNELS_METHOD_URL, $data, 'Content-Type:application/json');
} else {
	echo "Nothing";
}

include_once('include/php-ga.inc');

?>
