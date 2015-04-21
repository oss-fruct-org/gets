<?php

include_once('../include/config.inc');

if (!defined("TESTING_MODE") || TESTING_MODE !== true) {
    header('HTTP/1.0 403 Forbidden');
    echo 'Allowed only in testing mode!';
    die();
}

$dbconn = pg_connect(GEO2TAG_DB_STRING);
pg_exec($dbconn, 'DELETE FROM "adminUsers";');
pg_exec($dbconn, 'DELETE FROM "trustedUsers";');

pg_exec($dbconn, "DELETE FROM channel;");
pg_exec($dbconn, "DELETE FROM category;");
pg_exec($dbconn, "DELETE FROM users;");

pg_exec($dbconn, "ALTER SEQUENCE users_seq RESTART WITH 1");
pg_exec($dbconn, "ALTER SEQUENCE category_seq RESTART WITH 1");

pg_insert($dbconn, "users", array("login" => GEO2TAG_USER, "email" => GEO2TAG_EMAIL, "password" => GEO2TAG_PASSWORD));
pg_insert($dbconn, "category", array("name" => "obstacles", "description" => "Obstacles", "url" => 'http://example.com', "owner_id" => 1));
pg_insert($dbconn, "adminUsers", array("admin_id" => 1, "owner_id" => 1));