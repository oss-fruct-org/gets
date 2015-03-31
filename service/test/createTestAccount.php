<?php

include_once('../include/config.inc');
include_once('../include/auth.inc');

header('Content-Type: text/plain');

if (!defined("TESTING_MODE") || TESTING_MODE !== true) {
    header('HTTP/1.0 403 Forbidden');
    echo 'Allowed only in testing mode!';
    die();
}

echo auth_create_initial_test_token();