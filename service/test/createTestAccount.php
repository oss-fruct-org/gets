<?php

include_once('../include/config.inc');
include_once('../include/auth.inc');

header('Content-Type: text/plain');

if (!defined("TESTING_MODE") || TESTING_MODE !== true) {
    header('HTTP/1.0 403 Forbidden');
    echo 'Allowed only in testing mode!';
    die();
}

$token = auth_create_initial_test_token();
$dbconn = pg_connect(GEO2TAG_DB_STRING);

auth_refresh_db_access($dbconn);
$user_id = auth_get_db_id($dbconn);

if (isset($_GET["trusted"]) && $_GET["trusted"] === "true") {
    pg_insert($dbconn, "trustedUsers", array("user_id" => $user_id, "owner_id" => 1));
}

echo $token;