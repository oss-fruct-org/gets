<?php
/*
    Function adds user to database

    Params:
	login - any non existent login
	password - see geo2tag restrictions for password
	email - valid email address

    Example of using: curl -d "<methodCall><methodName>addUser</methodName><params><param><struct><member><name>login</name><value>user</value></member><member><name>password</name><value>pass</value></member><member><name>email</name><value>user@domain.com</value></member></struct></param></params></methodCall>" http://192.168.112.107/gets/geo2tag.php
 */

    function adduser_func($method_name, $params, $app_data)
    {
	return $params;
    }
?>