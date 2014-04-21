<?php
include_once('config.inc');

define('LOGIN_METHOD_URL', 'http://' . GETS_SERVER_URL . 'login.php');
define('LOGOUT_METHOD_URL', 'http://' . GETS_SERVER_URL . 'logout.php');
define('AVAILABLE_CHANNELS_METHOD_URL', 'http://' . GETS_SERVER_URL . 'available_channels.php');
define('WRITE_TAG_METHOD_URL', 'http://' . GETS_SERVER_URL . 'addPoints.php');
define('SUBSCRIBED_METHOD_URL', 'http://' . GETS_SERVER_URL . 'subscribed.php');
define('SUBSCRIBE_METHOD_URL', 'http://' . GETS_SERVER_URL . 'subscribe.php');
define('UNSUBSCRIBE_METHOD_URL', 'http://' . GETS_SERVER_URL . 'unsubscribe.php');
define('LOAD_POINTS_METHOD_URL', 'http://' . GETS_SERVER_URL . 'loadPoints.php');
define('ADD_CHANNEL_METHOD_URL', 'http://' . GETS_SERVER_URL . 'addChannel.php');
define('GET_CATEGORIES_METHOD_URL', 'http://' . GETS_SERVER_URL . 'getCategories.php');
?>