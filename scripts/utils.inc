<?php

require_once 'config.inc';

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

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
    $sess_id = sha1("2b7mPwLS" . $token);
    session_id($sess_id);
    session_start();

    if (isset($_SESSION['cached_email'])) {
        return $_SESSION['cached_email'];
    }

    $token = htmlspecialchars($token);
    $request = "<request><params><auth_token>{$token}</auth_token></params></request>";

    $response_str = process_request(GEO2TAG_USER_INFO_URL, $request, 'Content-Type: text/xml');
    $response_xml = simplexml_load_string($response_str);

    if (!$response_xml) {
        return null;
    }

    $emails = $response_xml->xpath('/response/content/userInfo/email');
    if (count($emails) == 0) {
        return null;
    }

    $email = (string) $emails[0];
    $_SESSION['cached_email'] = $email;

    $coreUsers = $response_xml->xpath('/response/content/userInfo/isCoreUser');
    if (count($coreUsers) != 0) {
        $coreUser = (string) $coreUsers[0];
	$_SESSION['isCoreUser'] = $coreUser;
    }

    return $email;
}

function get_parameter($params, $name) {
    if (array_key_exists($name, $params[0])) {
        $value = $params[0][$name];
        return $value;
    } else {
        trigger_error("Parameter ${name} didn't specified", E_USER_ERROR);
        die();
    }
}

?>
