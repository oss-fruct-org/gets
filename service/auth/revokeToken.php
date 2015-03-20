<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/config.inc');
include_once('../include/header.inc');

try {
    $dom = get_input_dom('../schemes/authToken.xsd');
    $gets_token = get_request_argument($dom, "auth_token", null);

    auth_set_token($gets_token);
    auth_revoke();
    send_result(0, 'success', "success");
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
