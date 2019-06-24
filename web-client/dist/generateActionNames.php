<?php

require_once("config.php");
header('Content-Type: application/javascript');

$base_url = '//' . $_SERVER['SERVER_NAME'] . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

if(defined('GETS_WEB_HOST'))
    $base_url = '//' . GETS_WEB_HOST . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

$js_file = 'var ADD_POINT_ACTION = "' . $base_url . 'actions/addPoint.php";';
$js_file .= 'var ADD_TRACK_ACTION = "' . $base_url . 'actions/addTrack.php";';
$js_file .= 'var GET_CATEGORIES_ACTION = "' . $base_url . 'actions/getCategories.php";';
$js_file .= 'var GET_POINTS_ACTION = "' . $base_url . 'actions/getPoints.php";';
$js_file .= 'var GET_JSON_ACTION = "' . $base_url . 'actions/jsonWrite.php";';
$js_file .= 'var GET_ROUTES_ACTION = "' . $base_url . 'actions/getRoutes.php";';
$js_file .= 'var GET_TRACK_BY_NAME_ACTION = "' . $base_url . 'actions/getTrackByName.php";';
$js_file .= 'var GET_TRACKS_ACTION = "' . $base_url . 'actions/getTracks.php";';
$js_file .= 'var GET_UPLOAD_LINK_ACTION = "' . $base_url . 'actions/getUploadLink.php";';
$js_file .= 'var GET_USER_INFO_ACTION = "' . $base_url . 'actions/getUserInfo.php";';
$js_file .= 'var IS_LOGGED_IN_ACTION = "' . $base_url . 'actions/isLoggedIn.php";';
$js_file .= 'var LOGIN_ACTION = "' . $base_url . 'actions/login.php";';
$js_file .= 'var LOGOUT_ACTION = "' . $base_url . 'actions/logout.php";';
$js_file .= 'var REMOVE_POINT_ACTION = "' . $base_url . 'actions/removePoint.php";';
$js_file .= 'var REMOVE_TRACK_ACTION = "' . $base_url . 'actions/removeTrack.php";';
$js_file .= 'var UPDATE_POINT_ACTION = "' . $base_url . 'actions/updatePoint.php";';
$js_file .= 'var UPLOAD_FILE_ACTION = "' . $base_url . 'actions/uploadFile.php";';
$js_file .= 'var PUBLISH_ACTION = "' . $base_url . 'actions/publish.php";';
$js_file .= 'var UNPUBLISH_ACTION = "' . $base_url . 'actions/unpublish.php";';

$js_file .= 'var RETRANSLATOR_ACTION = "' . $base_url . 'actions/retranslator.php";';

echo $js_file;
?>
