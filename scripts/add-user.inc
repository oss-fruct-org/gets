<?php
/*
    Function adds user to database

    Params:
	login - any non existent login
	password - see geo2tag restrictions for password
	email - valid email address

    Example of using: curl -d "<methodCall><methodName>addUser</methodName><params><param><struct><member><name>login</name><value>user</value></member><member><name>password</name><value>pass</value></member><member><name>email</name><value>user@domain.com</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function adduser_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("login", $params[0]))
	    $login = $params[0]["login"];
	else {
	    trigger_error("Login did not specified", E_USER_ERROR);
	    die();
	}
	$login = pg_escape_string($login);

	if (array_key_exists("password", $params[0]))
	    $pass = $params[0]["password"];
	else {
	    trigger_error("Password did not specified", E_USER_ERROR);
	    die();
	}
	$pass = pg_escape_string($pass);
	    
	if (array_key_exists("email", $params[0])) 
	    $email = $params[0]["email"];
	else {
	    trigger_error("Email did not specified", E_USER_ERROR);
	    die();
	}
	$email = pg_escape_string($email);

	/* check availability user name */

	$sql_request = "select count(*) from users where email='$email' or login='$login';";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$row = pg_fetch_row($res);

	if ($row[0] > 0) {
	    trigger_error("The login and(or) email already exists");
	    die();
	}

	$sql_request = "insert into users (login, password, email) values ('$login', '$pass', '$email');";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$sql_request = "select login from users where login='$login';";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}
	$row = pg_fetch_row($res);
	if (!$row) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$user = $row[0];

        return "User '$user' added";
    }
?>