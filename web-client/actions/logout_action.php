<?php

include_once('utils.inc');
include_once('methods_url.inc');

session_start();
if (isset($_SESSION['g2t_token'])) {

    $params = '<auth_token>' . $_SESSION['g2t_token'] . '</auth_token>';
    $data = form_request($params);

    /* Initialize and configure curl request */
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml'));
    curl_setopt($ch, CURLOPT_URL, LOGOUT_METHOD_URL);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    /* Execute request and send result to the client */
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo curl_error($ch);
    } else {
        $dom = new DOMDocument();
        $dom->loadXML($result);

        if (!$dom) {
            die('Error: resource isn\'t XML document.');
        }

        if ($dom->getElementsByTagName('code')->item(0)->nodeValue == 0) {
            session_destroy();
            //$log = fopen("../log.txt", "a+");
            //fwrite($log, '[' . date('H:i:s d-m-Y') . '] ' . 
            //			 'IP: ' . $_SERVER['REMOTE_ADDR'] .
            //			 ' HTTP_AGENT: ' . $_SERVER['HTTP_USER_AGENT'] . 
            //			 " (session closed)\n");
            //fclose($log);
            header("Location:../login.php");
        } else {
            header("Location:../user.php");
        }
        curl_close($ch);
    }
} else {
    header("Location:../login.php");
}
?>