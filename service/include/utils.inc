<?php
include_once('geo2tag_errors_list.inc');
include_once('config.inc');
include_once('methods_url.inc');
include_once('auth.inc');

define('SPACE_ALL', 0);
define('SPACE_PUBLIC', 1);
define('SPACE_PRIVATE', 2);

/*
    Function processes request to geo2tag server

    Params:
        method - url of method that need to be called in geo2tag
	data - data in JSON format that need to be sent along with the request
	content_type - type of content in HTTP notation
 */
function process_request($method, $data, $content_type) {
	/* Initialize and configure curl request */
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, array($content_type));
	curl_setopt($ch, CURLOPT_URL, $method);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

	/* Execute request and send result to the client */
	$result = curl_exec($ch);
	if (curl_errno($ch)) {
		echo curl_error($ch);
		return;
	} else {
		curl_close($ch);
		return $result;
	}
}

/*
   Function performs json request using google authentication method
 */
function process_json_request($method, $array, $gets_token = null, $allow_token_refreshing = true) {
    if ($gets_token !== null) {
        auth_set_token($gets_token);
        $geo2tag_token = auth_get_geo2tag_token();
        session_commit();
        $array['auth_token'] = $geo2tag_token;
    }
    $request_json = json_encode($array);

    $response_json = process_request($method, $request_json, 'Content-Type:application/json');
    if (!$response_json) {
        throw new Exception('Error: problem with request to geo2tag.');
    }

    $response_array = json_decode($response_json, true);
    if (!$response_array) {
        throw new Exception('Error: can\'t decode data from geo2tag.');
    }

    $response_code = $response_array['errno'];
    if ($response_code === WRONG_TOKEN_ERROR && $allow_token_refreshing === true && $gets_token !== null) {
        auth_set_token($gets_token);
        auth_refresh_geo2tag_access();
        session_commit();

        return process_json_request($method, $array, $gets_token, false);
    }

    if ($response_code !== SUCCESS) {
        $error_str = check_errors($response_code);

        switch ($response_code) {
        case CHANNEL_ALREADY_EXIST_ERROR: 
            throw new ChannelAlreadyExistException($error_str, $response_code);
        case CHANNEL_ALREADY_SUBSCRIBED_ERROR:
            throw new ChannelAlreadySubscribedException($error_str, $response_code);
        case CHANNEL_NOT_SUBCRIBED_ERROR:
            throw new ChannelNotSubscribedException($error_str, $response_code);
        case WRONG_TOKEN_ERROR:
            throw new WrongTokenException($error_str, $response_code);
        default:
            throw new Exception($error_str, $response_code);
        }
    }

    return $response_array;
}

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
	$xml_response .= "</status>\n";
	$xml_response .= '<content>' . $content . '</content>';
	$xml_response .= "</response>\n";
	echo $xml_response;
}

/**
    Function finds and returns named argument from request DOM
    Params:
        dom - DOM representing client request
        field - name of argument
        default_value (optional) - return value if argument not specified

    Returns:
        argument as string or null if argument not specified  

 */
function get_request_argument($dom, $field, $default_value = null) {
    $element = $dom->getElementsByTagName($field);
    $is_defined = $element->length > 0;
    if ($is_defined)
        return $element->item(0)->nodeValue;
    else
        return $default_value;
}

function get_array_element($array, $field, $default_value = null) {
    if (array_key_exists($field, $array))
        return $array[$field];
    else
        return $default_value;
}

/**
    Returns all available categories as array
    Params:
        token - optional token for caching categories

    Returns:
        array of categories represented as dictionaries {id, name, description, url}

    Throws:
        Exception on network error
 */
function get_categories($token = null) {
    $categories_request_content = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>getCategories</methodName></methodCall>';
    $categories_response = process_request(GETS_SCRIPTS_URL,
                                    $categories_request_content,
                                    'Content-Type: text/xml');

    if (!$categories_response)
        throw new Exception('Cannot request categories from geo2tag');


    $categories_response_dom = new DOMDocument();
    $categories_response_dom->loadXML($categories_response);
    if (!$categories_response_dom) 
        throw new Exception('Categories response not XML file');


    $idx = 0;
    $ret = array();

    $categories = $categories_response_dom->getElementsByTagName('struct');
    foreach ($categories as $category) {
        $item = array();
        $members = $category->getElementsByTagName('member');
        foreach ($members as $member) {
            $tag_name = $member->getElementsByTagName('name')->item(0)->nodeValue;
            $item[$tag_name] = $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
        }

        $ret[$idx++] = $item;
    }

    return $ret;
}

/**
    Checks if channel for category_id exists and creates it otherwise
    Params:
        $auth_token - if not null channel will be private
        $category_id - id of category
    
    Returns:
        name of channel
  */
function ensure_category_channel($auth_token, $category_id) {
    $xmlrpc_request = xmlrpc_encode_request('getCategoryChannel',
        array('gets_token' => $auth_token,
              'category_id' => $category_id));

    $xmlrpc_response =  process_request(GETS_SCRIPTS_URL, $xmlrpc_request, 'Content-Type: text/xml');
    $xmlrpc = xmlrpc_decode($xmlrpc_response);

    if (is_array($xmlrpc) && xmlrpc_is_fault($xmlrpc)) {
        return null;
    }

    $channel_name = $xmlrpc;
    return $channel_name;
}

/**
    Like var_dump but outputs to error log instead of stdin
  */
function dump_error_log($object) {
    ob_start();
    var_dump($object);
    $contents = ob_get_contents();
    ob_end_clean();
    error_log($contents);
}

# http://stackoverflow.com/questions/2040240/php-function-to-generate-v4-uuid
function uuidv4()
{
    $data = openssl_random_pseudo_bytes(16);
    assert(strlen($data) == 16);

    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

?>
