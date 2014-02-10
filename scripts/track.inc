<?php
/**
 * Function adds new track to database
 * Params:
 * name - name of track
 * description - description of channel
 * url - url
 */

function addtrack_func($method_name, $params, $app_data) {
    global $dbconn;

    if (array_key_exists("name", $params[0])) {
        $name = $params[0]["name"];
        $name = pg_escape_string($name);
        $name = "'$name'";
    } else {
        trigger_error("Track name did not specified", E_USER_ERROR);
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


    // Check if track name already exists
    $sql_request = "select count(*) from track where track.name=$name;";
    $res = pg_query($dbconn, $sql_request);

    if (!$res) {
        trigger_error("SQL error", E_USER_ERROR);
        die();
    }

    $row = pg_fetch_row($res);
    if ($row[0] > 0) {
        trigger_error("The track name already exists");
        die();
    }

    $sql_request = "insert into track (name, description, url) values ($name, $description, $url);";
    $res = pg_query($dbconn, $sql_request);

    if (!$res) {
        trigger_error("SQL error", E_USER_ERROR);
        die();
    }

    return "Ok";
}


function gettracks_func($method_name, $params, $app_data) {
    global $dbconn;

    $sql_request = "select * from track;";
    $res = pg_query($dbconn, $sql_request);
    if (!$res) {
        trigger_error("SQL error", E_USER_ERROR);
        die();
    }

    return pg_fetch_all($res);
}

?>
