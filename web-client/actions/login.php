<?php

require_once('utils/methods_url.inc');
require_once('utils/process_request.inc');
require_once('utils/form_request.inc');

// check for submit
if (!empty($_POST['submitlogin'])) {

    $params = '<login>' . htmlspecialchars($_POST['login_name']) . '</login>' .
            '<password>' . htmlspecialchars($_POST['login_password']) . '</password>';
    
    $return_url = urldecode(htmlspecialchars($_POST['return_url']));
    
    $data = form_request($params);
    
    $response = process_request(LOGIN_METHOD_URL, $data, 'Content-Type: text/xml');
    if (isset($response)) {
        //session start        
        $dom = new DOMDocument();
        $dom->loadXML($response);

        if (!$dom) {
            die('Error: resource isn\'t XML document.');
        }

        if ($dom->getElementsByTagName('code')->item(0)->nodeValue == 0) {
            
            session_start();

            // assign data to the session
            $_SESSION['login_name'] = htmlspecialchars($_POST['login_name']);
            $_SESSION['g2t_token'] = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;

            /*$log = fopen("../log.txt", "a+");
            fwrite($log, '[' . date('H:i:s d-m-Y') . '] ' .
                    'IP: ' . $_SERVER['REMOTE_ADDR'] .
                    ' HTTP_AGENT: ' . $_SERVER['HTTP_USER_AGENT'] .
                    " (session started)\n");
            fclose($log);*/
 
            // check the user information and perform the redirect
            if (isset($_SESSION['g2t_token']) && isset($_SESSION['login_name'])) {
                if (!empty($return_url)) {
                    header("Location:../$return_url");
                } else {
                    header("Location:../user.php");
                }
            }
        } else {
            header("Location:../login.php?badlogin=1");
        }
    }
} elseif (!empty($_GET['googlelogin'])) {
    if (isset($_GET['auth_token'])) {
        $return_url = urldecode(htmlspecialchars($_GET['return_url']));
        session_start();
        $_SESSION['g2t_token'] = $_GET['auth_token'];
        if (!empty($return_url)) {
            header("Location:../$return_url");
        } else {
            header("Location:../user.php");
        }
    }                
} else {
    echo 'jj';
}
?>