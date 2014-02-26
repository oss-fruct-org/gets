<?php
/*
    Function removes channel from database

    Params:
	user - any existed user name (max 50 symbols)
	channel - any existed channel name (max 300 symbols)
	login - geo2tag admin login
	password - geo2tag admin password

    Example of using: curl -d "<methodCall><methodName>deleteChannel</methodName><params><param><struct><member><name>user</name><value>gets2</value></member><member><name>channel</name><value>New channel</value></member><member><name>login</name><value>root</value></member><member><name>password</name><value>pass</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function deleteChannel_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("user", $params[0])) {
	    $user = $params[0]["user"];
	    $user = pg_escape_string($user);
	    $user = "'$user'";
	} else {
        $user = null;
	    #trigger_error("User did not specified", E_USER_ERROR);
	    #die();
	}

	if (array_key_exists("channel", $params[0])) {
	    $channel = $params[0]["channel"];
	    $channel = pg_escape_string($channel);
	    $channel = "'$channel'";
	} else {
	    trigger_error("Channel did not specified", E_USER_ERROR);
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

    if ($user)
	    $sql_request = "delete from channel where channel.id in (select channel.id from channel, users where (users.id = channel.owner_id) and (users.login = $user) and (channel.name = $channel))";
    else
        $sql_request = "delete from channel where channel.name = $channel";

    error_log($sql_request);

	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$countRows = pg_affected_rows($res);

        return "Removed '$countRows' channel(s)";
    }
    
?>
