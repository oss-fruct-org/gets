<?php

require_once 'utils.inc';

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
    Function removes tag with given parameters from database

    Required parameters:
    channel - channel name
    gets_token - token of owner of tags

    Params:
    name - filter by name (optional)
    latitude
    longitude
    uuid
    time
    description


Example:
<methodCall>
  <methodName>deleteTag2</methodName>
  <params>
    <param>
      <struct>
        <member>
          <name>name</name>
          <value>tag-name</value>
        </member>
        <member>
          <name>category_id</name>
          <value>1</value>
        </member>
        <member>
          <name>gets_token</name>
          <value>token</value>
        </member>
      </struct>
    </param>
  </params>
</methodCall>
 */

    function deleteTag2_func($method_name, $params, $app_data) {
        global $dbconn;

        if (array_key_exists('channel', $params[0])) {
            $channel_name = pg_escape_string($params[0]['channel']);
        } else {
            trigger_error("Channel name not specified");
            die();
        }

        if (array_key_exists('gets_token', $params[0])) {
            $gets_token = $params[0]['gets_token'];
        } else {
            trigger_error("Gets token not specified");
            die();
        }

        $email = receive_email_by_token($gets_token);
        if (!$email) {
            trigger_error("Can't receive user e-mail", E_USER_ERROR);
            die();
        }
        $email_r = pg_escape_string($email);
        
        $channel_where = "tag.channel_id IN (SELECT id FROM channel WHERE channel.name='{$channel_name}' AND channel.owner_id IN (SELECT id FROM users WHERE email='{$email_r}'))";

        $simple_keys = array('name', 'latitude', 'longitude', 'time');
        $where_arr = array();

        if (array_key_exists('name', $params[0])) {
            $value = pg_escape_string($params[0]['name']);
            $where_arr[] = "tag.label='{$value}'";
        }
        if (array_key_exists('time', $params[0])) {
            $value = pg_escape_string($params[0]['time']);
            $where_arr[] = "tag.time='{$value}'";
        }
        if (array_key_exists('latitude', $params[0])) {
            $value = (double) $params[0]['latitude'];
            $where_arr[] = "tag.latitude={$value}";
        }
        if (array_key_exists('longitude', $params[0])) {
            $value = (double) $params[0]['longitude'];
            $where_arr[] = "tag.latitude={$value}";
        }
        if (array_key_exists('description', $params[0])) {
            $value = pg_escape_string($params[0]['description']);
            $where_arr[] = "safe_cast_to_json(tag.description)->>'description'='{$value}'";
        }
        if (array_key_exists('uuid', $params[0])) {
            $value = pg_escape_string($params[0]['value']);
            $where_arr[] = "safe_cast_to_json(tag.description)->>'value'='{$value}'";
        }

        $where_arr[] = "true";
        $optional_where = implode('AND', $where_arr);

        $base_query = "DELETE FROM tag WHERE ({$channel_where}) AND ({$optional_where})";
        $res = pg_query($dbconn, $base_query);

        if (!$res) {
            trigger_error("SQL error", E_USER_ERROR);
            die();
        }

        $countRows = pg_affected_rows($res);
        return "Removed '$countRows' row(s)";
    }


/*
    Function updates tag with given parameters in database

    Required parameters:
    gets_token - gets token

    Optional parameters:
    uuid - tag uuid (optional)
    channel - channel name (optional)
    name - filter by name (optional)
    category_id - filter by category id (optional)

    New tag parameters:
    label
    url
    description
    latitude
    longitude
    altitude

    Any parameter can be ommited

Example:
<methodCall>
  <methodName>updateTag</methodName>
  <params>
    <param>
      <struct>
        <member>
          <name>channel</name>
          <value>channel-name</value>
        </member>
        <member>
          <name>gets_token</name>
          <value>token</value>
        </member>
        <member>
          <name>name</name>
          <value>tag-name</value>
        </member>
        <member>
          <name>category_id</name>
          <value>1</value>
        </member>

        <member>
          <name>description</name>
          <value>New description</value>
        </member>
      </struct>
    </param>
  </params>
</methodCall>
 */

    function add_set_string($field, $params, &$out_arr) {
        global $dbconn;
        if (array_key_exists($field, $params[0])) {
            $key = $field;
            $value = pg_escape_string($dbconn, $params[0][$field]);

            $out_arr[] = "{$key}='{$value}'";
        }
    }

    function updateTag_func($method_name, $params, $app_data) {
        global $dbconn;

        if (array_key_exists('gets_token', $params[0])) {
            $gets_token = $params[0]['gets_token'];
        } else {
            trigger_error("Gets token not specified");
            die();
        }

        $email = receive_email_by_token($gets_token);
        if (!$email) {
            trigger_error("Can't receive user e-mail", E_USER_ERROR);
            die();
        }
        $email_r = pg_escape_string($email);

        if (array_key_exists('channel', $params[0])) {
            $channel_name = pg_escape_string($params[0]['channel']);
            $channel_where = "tag.channel_id IN (SELECT id FROM channel WHERE channel.name='{$channel_name}' AND channel.owner_id IN (SELECT id FROM users WHERE email='{$email_r}'))";
        } else {
            $channel_where = 'true';
        }

        if (array_key_exists('uuid', $params[0])) {
            $uuid = pg_escape_string($params[0]['uuid']);
            $uuid_where = "safe_cast_to_json(tag.description)->>'uuid'='{$uuid}'";
        } else {
            $uuid_where = 'true';
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

        $access_where = "tag.user_id IN (SELECT id FROM users WHERE email='{$email_r}')";

        $set_array = array();
        add_set_string('label', $params, $set_array);
        add_set_string('url', $params, $set_array);
        add_set_string('description', $params, $set_array);
        add_set_string('latitude', $params, $set_array);
        add_set_string('longitude', $params, $set_array);
        add_set_string('altitude', $params, $set_array);

        if (count($set_array) === 0) {
            return "Updated '0' row(s)";
        }

        $set_string = implode($set_array, ',');

        $base_query = "UPDATE tag SET {$set_string} WHERE ({$access_where}) AND ({$uuid_where}) AND ({$channel_where}) AND ({$name_where}) AND ({$category_id_where});";
        error_log($base_query);
        $res = pg_query($dbconn, $base_query);

        if (!$res) {
            trigger_error("SQL error", E_USER_ERROR);
            die();
        }

        $countRows = pg_affected_rows($res);
        return "Updated '$countRows' row(s)";
    }

?>
