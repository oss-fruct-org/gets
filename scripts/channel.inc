<?php

require_once 'utils.inc';

/*
    Function removes channel from database

    Params:
	channel - any existed channel name (max 300 symbols)
    gets_token - gets token

    Example of using: curl -d "<methodCall><methodName>deleteChannel</methodName><params><param><struct><member><name>channel</name><value>New channel</value></member><member><name>gets_token</name><value>gdjkgfjgkjjkgl</value></member></struct></param></params></methodCall>" http://geo2tag.cs.prv/gets/geo2tag.php
 */

    function deleteChannel_func($method_name, $params, $app_data)
    {
	global $dbconn;

	if (array_key_exists("channel", $params[0])) {
	    $channel = $params[0]["channel"];
	    $channel = pg_escape_literal($channel);
	} else {
	    trigger_error("Channel did not specified", E_USER_ERROR);
	    die();
	}

	if (array_key_exists("gets_token", $params[0])) {
	    $gets_token = $params[0]["gets_token"];
	} else {
	    trigger_error("gets token did not specified", E_USER_ERROR);
	    die();
	}
	    
    $email = receive_email_by_token($gets_token);

    if (!$email) {
        trigger_error("Can't receive user e-mail", E_USER_ERROR);
        die();
    }
	    
    $email_r = pg_escape_literal($email);

	/* create request */
    $sql_request = "delete from channel where channel.name = {$channel} and channel.owner_id in (select id from users where email={$email_r});";
    error_log($sql_request);

	$res = pg_query($dbconn, $sql_request);

	if (!$res) {
	    trigger_error("SQL error", E_USER_ERROR);
	    die();
	}

	$countRows = pg_affected_rows($res);

        return "Removed '$countRows' channel(s)";
    }

/*
    Function returns description and url of channel with given name

    Required parameters:
    channel - channel name
    gets_token - gets token

Example:
<methodCall>
  <methodName>getChannelDescription</methodName>
  <params>
    <param>
      <struct>
        <member>
          <name>channel</name>
          <value>channel-name</value>
        </member>
        <member>
          <name>gets_token</name>
          <value>gets_token</value>
        </member>
      </struct>
    </param>
  </params>
</methodCall>
 */

    function getChannelDescription_func($method_name, $params, $app_data) {
        global $dbconn;

        if (array_key_exists('channel', $params[0])) {
            $channel_name = pg_escape_literal($params[0]['channel']);
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
        $email = pg_escape_literal($email);

        $query =
            "SELECT description,url FROM channel WHERE channel.name={$channel_name} AND channel.id IN 
                (SELECT subscribe.channel_id FROM users INNER JOIN subscribe ON users.id=subscribe.user_id WHERE users.email={$email});";
        $res = pg_query($dbconn, $query);

        if (pg_num_rows($res) === 0) {
            trigger_error("No such channel or wrong token", E_USER_ERROR);
            die();
        }

        return pg_fetch_all($res)[0];
    }

    
?>
