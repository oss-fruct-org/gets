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
    
/*
    Function gets list of categories

    Params:

    Example of using: curl -d "<methodCall><methodName>getCategories</methodName></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */
    function getcategories_func($method_name, $params, $app_data)
    {
	global $dbconn;

	$sql_request = "select * from category;";
	$res = pg_query($dbconn, $sql_request);
	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	return pg_fetch_all($res);
    }

/*
    Function removes category from list

    Params:
	id - category id
	login - geo2tag admin login
	password - geo2tag admin password

    Example of using: curl -d "<methodCall><methodName>deleteCategory</methodName><params><param><struct><member><name>id</name><value>2</value></member><member><name>login</name><value>root</value></member><member><name>password</name><value>pass</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */
    function deletecategory_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("id", $params[0])) {
	    $id = $params[0]["id"];
	    $id = pg_escape_string($id);
	    $id = intval($id);
	} else {
	    trigger_error("Category id did not specified", E_USER_ERROR);
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

	/* remove category */

	$sql_request = array("id" => $id);
	$res = pg_delete($dbconn, 'category', $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$sql_request = "select count(*) from category where id=$id;";
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

	if ($row[0] > 0) {
	    trigger_error("The rows was not deleted");
	    die();
	}

        return "Category '$id' removed";

    }
?>