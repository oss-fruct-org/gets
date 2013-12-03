<?php
include_once('config.php');

define('LOGIN_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/login');
define('LOGOUT_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/quitSession');
define('AVAILABLE_CHANNELS_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/channels');
define('WRITE_TAG_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/writeTag');
define('SUBSCRIBED_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/subscribed');
define('SUBSCRIBE_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/subscribe');
define('UNSUBSCRIBE_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/unsubscribe');
define('LOAD_POINTS_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/filterCircle');
define('ADD_CHANNEL_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/addChannel');
define('GET_CATEGORIES_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/gets/geo2tag.php');
define('FILTER_CHANNEL_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/filterChannel');
?>