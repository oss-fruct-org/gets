<?php

require_once("config.php");

$base_url = 'http://' . $_SERVER['SERVER_NAME'] . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

if (defined('GETS_WEB_HOST'))
    $base_url = 'http://' . GETS_WEB_HOST . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

$js_file = 'var MARKER_HOLE_IMAGE = "' . $base_url . 'images/icons/marker_hole.png";';
$js_file .= 'var LOCATION_IMAGE = "' . $base_url . 'images/icons/location.png";';
$js_file .= 'var TEMP_MARKER_IMAGE = "' . $base_url . 'images/icons/marker_hole_red.png";';

echo $js_file;
?>
