<?php
include_once('config.inc');

define('LOGIN_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/login');
define('LOGOUT_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/quitSession');
define('AVAILABLE_CHANNELS_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/channels');
define('WRITE_TAG_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/writeTag');
define('SUBSCRIBED_CHANNELS_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/subscribed');
define('SUBSCRIBE_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/subscribe');
define('UNSUBSCRIBE_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/unsubscribe');
define('LOAD_POINTS_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/filterCircle');
define('ADD_CHANNEL_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/addChannel');
define('ADDITIONAL_FUNCTIONS_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/gets/geo2tag.php');
define('FILTER_CHANNEL_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/filterChannel');
define('ALTER_CHANNEL_METHOD_URL', 'http://' . GEO2TAG_SERVER_URL . '/service/alterChannel');

define('GET_CATEGORIES_METHOD_URL_GETS', 'http://' . GETS_SERVER_URL . '/getCategories.php');
define('SUBSCRIBED_CHANNELS_METHOD_URL_GETS', 'http://' . GETS_SERVER_URL . '/subscribedChannels.php');
?>
