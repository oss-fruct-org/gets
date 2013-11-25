<?php
/*
    Function removes duplicate tags from database

    Params:
	name - any existed user name (max 50 symbols)
	channel - any existed channel name (max 300 symbols, not required)

    Example of using: curl -d "<methodCall><methodName>deleteDupTags</methodName><params><param><struct><member><name>name</name><value>gets2</value></member><member><name>channel</name><value>Gets-test</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function deleteDupTags_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("name", $params[0])) {
	    $name = $params[0]["name"];
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
    
?>