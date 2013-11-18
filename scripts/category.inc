<?php
/*
    Function adds category to database

    Params:
	name - any non existent name of category (max 300 symbols)
	description - any short category description (max 2048 symbols, not required)
	url - any url for corresponded category (max 2048 symbols, not required)

    Example of using: curl -d "<methodCall><methodName>addCategory</methodName><params><param><struct><member><name>name</name><value>shops</value></member><member><name>description</name><value>Shops, markets, etc.</value></member><member><name>url</name><value>http://en.wikipedia.org/wiki/Market</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function addcategory_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("name", $params[0])) {
	    $name = $params[0]["name"];
	    $name = pg_escape_string($name);
	    $name = "'$name'";
	} else {
	    trigger_error("Category name did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("description", $params[0])) {
	    $description = $params[0]["description"];
	    $description = pg_escape_string($description);
	    $description = "'$description'";
	} else {
	    $description = "NULL";
	}
	    
	if (array_key_exists("url", $params[0])) {
	    $url = $params[0]["url"];
	    $url = pg_escape_string($url);
	    $url = "'$url'";
	} else {
	    $url = "NULL";
	}

	/* check availability user name */

	$sql_request = "select count(*) from category where category.name=$name;";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$row = pg_fetch_row($res);

	if ($row[0] > 0) {
	    trigger_error("The category name already exists");
	    die();
	}

	$sql_request = "insert into category (name, description, url) values ($name, $description, $url);";
	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$sql_request = "select category.name from category where category.name=$name;";
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

	$name = $row[0];

        return "Category '$name' added";
    }
    
    function getcategories_func($method_name, $params, $app_data)
    {
	global $dbconn;
    }
?>