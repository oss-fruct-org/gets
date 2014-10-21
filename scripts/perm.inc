<?php 

function has_admin_rights($token, $projectID) {
    global $dbconn;
    
    $email = receive_email_by_token($token);
    
    if ($email == null)
	return false;

    if (isset($_SESSION['isCoreUser']))
	return true;

    // alternative check that user is a core user
    $sql_request = 'select count(*) from users where users.id='.$projectID.' and users.email=\''.$email.'\';';
    $res = pg_query($dbconn, $sql_request);

    if (!$res) {
	trigger_error("SQL error", E_USER_ERROR);
	die();
    }

    $row = pg_fetch_row($res);

    if ($row[0] > 0) {
	return true;
    }
    
    // try to find user in admins table
    $sql_request = 'select count(*) from "adminUsers",users where "adminUsers".owner_id=\''.$projectID.'\' and "adminUsers".admin_id=users.id and users.email=\''.$email.'\';';

    $res = pg_query($dbconn, $sql_request);

    if (!$res) {
	trigger_error("SQL error", E_USER_ERROR);
	die();
    }

    $row = pg_fetch_row($res);

    if ($row[0] > 0) {
	return true;
    }

    return false;
}

function check_token_permissions($gets_token, $requested_email) {

}

?>
