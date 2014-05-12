<?php
/*
    Function removes duplicate tags from database

    Params:
	user - any existed user name (max 50 symbols)
	channel - any existed channel name (max 300 symbols, not required)

    Example of using: curl -d "<methodCall><methodName>deleteDupTags</methodName><params><param><struct><member><name>user</name><value>gets2</value></member><member><name>channel</name><value>Gets-test</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function deleteDupTags_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("user", $params[0])) {
	    $name = $params[0]["user"];
	    $name = pg_escape_string($name);
	    $name = "'$name'";
	} else {
	    trigger_error("User's name did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("channel", $params[0])) {
	    $channel = $params[0]["channel"];
	    $channel = pg_escape_string($channel);
	    $channel = "'$channel'";
	} else {
	    $channel = "";
	}
	    
	/* create request */

	if ($channel != "") {
	    $sql_request = "delete from tag where tag.id in (select t2.id from tag as t1, tag as t2, users, channel where (t1.latitude=t2.latitude) and (t1.longitude = t2.longitude) and (t1.altitude = t2.altitude) and (t1.label = t2.label) and (t1.description = t2.description) and (t1.url = t2.url) and (t1.user_id = t2.user_id) and (t1.user_id = users.id) and (users.login = $name) and (t1.channel_id = t2.channel_id) and (t1.channel_id = channel.id) and (channel.owner_id = users.id) and (channel.name = $channel) and (t1.id > t2.id))";
	} else {
	    $sql_request = "delete from tag where tag.id in (select t2.id from tag as t1, tag as t2, users where (t1.latitude=t2.latitude) and (t1.longitude = t2.longitude) and (t1.altitude = t2.altitude) and (t1.label = t2.label) and (t1.description = t2.description) and (t1.url = t2.url) and (t1.user_id = t2.user_id) and (t1.user_id = users.id) and (users.login = $name) and (t1.channel_id = t2.channel_id) and (t1.id > t2.id))";
	}

	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$countRows = pg_affected_rows($res);

        return "Removed '$countRows' duplicate rows";
    }
    
/*
    Function removes tag from database

    Params:
	tag_id - any existed tag id (positive integer)
	login - geo2tag admin login
	password - geo2tag admin password

    Example of using: curl -d "<methodCall><methodName>deleteTag</methodName><params><param><struct><member><name>tag_id</name><value>187</value></member><member><name>login</name><value>root</value></member><member><name>password</name><value>pass</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function deleteTag_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("tag_id", $params[0])) {
	    $tagid = $params[0]["tag_id"];
	    $tagid = pg_escape_string($tagid);
	    $tagid = intval($tagid);
	} else {
	    trigger_error("Tag id did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("login", $params[0])) {
	    $login = $params[0]["login"];
	    $login = pg_escape_string($login);
	    $login = "'$login'";
	} else {
	    trigger_error("Administrator login did not specified", E_USER_ERROR);
	    die();
	}
	    
	if (array_key_exists("password", $params[0])) {
	    $password = $params[0]["password"];
	    $password = pg_escape_string($password);
	    $password = "'$password'";
	} else {
	    $password = "NULL";
	}

	check_permissions($login, $password);
	    
	/* create request */

	$sql_request = "delete from tag where tag.id = $tagid";

	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$countRows = pg_affected_rows($res);

        return "Removed '$countRows' row(s)";
    }

/*
    Function removes tag with given parameters from database

    Required parameters:
    channel - channel name

    Params:
    name - filter by name (optional)
    category_id - filter by category id (optional)

 */

    function deleteTag2_func($method_name, $params, $app_data) {
        global $dbconn;

        if (array_key_exists('channel', $params[0])) {
            $channel_name = pg_escape_string($params[0]['channel']);
            $channel_where = "tag.channel_id IN (SELECT id FROM channel WHERE name='{$channel_name}')";
        } else {
            trigger_error("Channel name not specified");
            die();
        }

        if (array_key_exists('name', $params[0])) {
            $name = pg_escape_string($params[0]['name']);
            $name_where = "tag.label='{$name}'";
        } else {
            $name_where = 'true';
        }

        if (array_key_exists('category_id', $params[0])) {
            $category_id = pg_escape_string($params[0]['category_id']);
            $category_id_where = "safe_cast_to_json(tag.description)->>'category_id'='{$category_id}'";
        } else {
            $category_id_where = 'true';
        }

        $base_query = "DELETE FROM tag WHERE ({$channel_where}) AND ({$name_where}) AND ({$category_id_where})";
        $res = pg_query($dbconn, $base_query);

        if (!$res) {
            trigger_error("SQL error", E_USER_ERROR);
            die();
        }

        $countRows = pg_affected_rows($res);
        return "Removed '$countRows' row(s)";
    }
    
?>
