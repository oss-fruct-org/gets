<?php
include_once('geo2tag_errors_list.inc');

/*
    Function for checking for errors in response from geo2tag

    Params:
        code - errno code that geo2tag send in response
 */
function check_errors($code) {
	switch($code) {
		case SUCCESS:
			return 'Ok';
		case WRONG_TOKEN_ERROR:
			return 'Wrong token error';
		case USER_ALREADY_EXIST_ERROR:
			return 'User already exist error';
		case USER_DOES_NOT_EXIST_ERROR:
			return 'User does not exist error';
		case CHANNEL_ALREADY_EXIST_ERROR:
			return 'Channel already exist error';
		case CHANNEL_DOES_NOT_EXIST_ERROR:
			return 'Channel does not exist error';
		case SUBSCRIPTION_ALREADY_EXIST:
			return 'Subscription already exist error';
		case INTERNAL_DB_ERROR:
			return 'Internal database error';
		case INCORRECT_QUERY_NAME_ERROR:
			return 'Incorrect query name error';
		case INCORRECT_JSON_ERROR:
			return 'Incorrect JSON error';
		case INCORRECT_CREDENTIALS_ERROR:
			return 'Incorrect credentials error';
		case CHANNEL_NOT_SUBCRIBED_ERROR:
			return 'Channel not subscribed error';
		case CHANNEL_ALREADY_SUBSCRIBED_ERROR:
			return 'Channel already subscribed error';
		case TAG_DOES_NOT_EXIST_ERROR:
			return 'Tag does not exist error';
		case TAG_ALREADY_EXIST_ERROR:
			return 'Tag already exist error';
		case NULL_TIMESLOT_ERROR:
			return 'Null timeslot error';
		case UNKNOWN_ERROR:
			return 'Unknown error';
		case TMP_USER_ALREADY_EXIST_ERROR:
			return 'TMP user already exist error';
		case NETWORK_ERROR:
			return 'Network error';
		case EMAIL_ALREADY_EXIST_ERROR:
			return 'Email already exist error';
		case WEAK_PASSWORD_ERROR:
			return 'Weak password error';
		case NOT_SUPPORTED:
			return 'Not supported';
		case DB_DOES_NOT_EXIST_ERROR:
			return 'Database does not exist error';
		case USER_DOES_NOT_OWN_CHANNEL_ERROR:
			return 'User does not own channel error';
		default:
			return 'Unlisted error';
	}
}

function send_error($code, $message) {
	$xml_response = '<?xml version="1.0" encoding="UTF-8"?>';
	$xml_response .= '<response><status>';
	$xml_response .= '<code>' . $code . '</code>';
	$xml_response .= '<message>' . $message . '</message>';
	$xml_response .= '</status></response>';
	echo $xml_response;
}

function send_result($code, $message, $content) {
	$xml_response = '<?xml version="1.0" encoding="UTF-8"?>';
	$xml_response .= '<response><status>';
	$xml_response .= '<code>' . $code . '</code>';
	$xml_response .= '<message>' . $message . '</message>';
	$xml_response .= '</status>';
	$xml_response .= '<content>' . $content . '</content>';
	$xml_response .= '</response>';
	echo $xml_response;
}
?>