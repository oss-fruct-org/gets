<?php

require_once 'config.inc';

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

function receive_email_by_token($token) {
    $token = htmlspecialchars($token);
    $request = "<request><params><auth_token>{$token}</auth_token></params></request>";

    $response_str = process_request(GEO2TAG_USER_INFO_URL, $request, 'Content-Type: text/xml');
    $response_xml = simplexml_load_string($response_str);

    if (!$response_xml) {
        return null;
    }

    $emails = $response_xml->xpath('/response/content/email');
    if (count($emails) == 0) {
        return null;
    }

    $email = (string) $emails[0];
    return $email;
}

?>
