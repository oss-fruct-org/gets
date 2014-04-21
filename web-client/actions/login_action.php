<?php

include_once('utils.inc');
include_once('methods_url.inc');

// check for submit
if (!empty($_POST['submitlogin'])) {

    $params = '<login>' . htmlspecialchars($_POST['login_name']) . '</login>' .
            '<password>' . htmlspecialchars($_POST['login_password']) . '</password>';
    $data = form_request($params);
    
    $response = process_request(LOGIN_METHOD_URL, $data, 'Content-Type: text/xml');
    if (isset($response)) {
        //session start
        session_start();
        $dom = new DOMDocument();
        $dom->loadXML($response);

        if (!$dom) {
            die('Error: resource isn\'t XML document.');
        }

        if ($dom->getElementsByTagName('code')->item(0)->nodeValue == 0) {

            // assign data to the session
            $_SESSION['login_name'] = htmlspecialchars($_POST['login_name']);
            $_SESSION['login_password'] = htmlspecialchars($_POST['login_password']);
            $_SESSION['g2t_token'] = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;

            /*$log = fopen("../log.txt", "a+");
            fwrite($log, '[' . date('H:i:s d-m-Y') . '] ' .
                    'IP: ' . $_SERVER['REMOTE_ADDR'] .
                    ' HTTP_AGENT: ' . $_SERVER['HTTP_USER_AGENT'] .
                    " (session started)\n");
            fclose($log);*/
 
            // check the user information and perform the redirect
            if (isset($_SESSION['g2t_token']) && isset($_SESSION['login_name'])) {
                header("Location:../user.php");
            }
        } else {
            header("Location:../login.php?badlogin=1");
        }
    }
} elseif (!empty($_GET['googlelogin'])) {
    if (isset($_GET['auth_token'])) {
        session_start();
        $_SESSION['g2t_token'] = $_GET['auth_token'];
        header("Location:../user.php");
    }                
}
?>