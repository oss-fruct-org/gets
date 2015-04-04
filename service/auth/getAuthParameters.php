<?php
    
include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/config.inc');
include_once('../include/header.inc');
    
try {
    $dom = get_input_dom("../schemes/empty.xsd");
    
    $xml = "<client_id>" . htmlspecialchars(GOOGLE_CLIENT_ID) . "</client_id>";
    $xml .= "<scope>https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email</scope>";
    
    send_result(0, 'success', $xml);
} catch (Exception $ex) {
    send_error($ex->getCode(), $ex->getMessage());
}