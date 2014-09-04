<?php

require_once('utils/methods_url.inc');
require_once('utils/process_request.inc');
require_once('utils/form_request.inc');

session_start();
if (isset($_SESSION['g2t_token'])) {

    $params = '<auth_token>' . $_SESSION['g2t_token'] . '</auth_token>';
    
    $return_url = '';
    if (isset($_GET['return_url'])) {
        $return_url = urldecode(htmlspecialchars($_GET['return_url']));
    }
    $data = form_request($params);

    $response = process_request(LOGOUT_METHOD_URL, $data, 'Content-Type: text/xml');
    if ($response) {   
        $dom = new DOMDocument();
        $dom->loadXML($response);

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
            if (!empty($return_url)) {
                header("Location:../$return_url");
            } else {
                header("Location:../user.php");
            }
        } else {
            session_destroy();
            header("Location:../user.php");
        }
    }
} else {
    header("Location:../user.php");
}
?>