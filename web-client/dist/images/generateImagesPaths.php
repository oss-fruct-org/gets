<?php
$base_url = 'http://' . $_SERVER['SERVER_NAME'] . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

$js_file = 'var MARKER_HOLE_IMAGE = "' . $base_url . 'icons/marker_hole.png";';
$js_file .= 'var LOCATION_IMAGE = "' . $base_url . 'icons/location.png";';

echo $js_file;
?>
