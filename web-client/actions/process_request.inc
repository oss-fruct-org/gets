<?php
/*
    Function processes request to GeTS server

    Params:
        method - url of method that need to be called in GeTS
		data - data that need to be sent along with the request
 */
function process_request($method, $data, $content_type) {
	/* Initialize and configure curl request */
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, array($content_type));
	curl_setopt($ch, CURLOPT_URL, $method);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

	/* Execute request and send result to the client */
	$result = curl_exec($ch);
	if (curl_errno($ch)) {
		echo curl_error($ch);
		return;
	} else {
		curl_close($ch);
		return $result;
	}
}
?>