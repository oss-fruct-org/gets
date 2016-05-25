<?php
define('GEO2TAG_USER_INFO_URL', 'http://gets.cs.petrsu.ru/gets-rating/gets/service/userInfo.php');
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/config.inc');

define(POSITIVE_VOTE, '1');
define(NEGATIVE_VOTE, '-1');

//error_reporting(E_ALL);
//ini_set("display_errors", 1);

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

function add_voting_channels($dbconn, $channel_data_array, $user_id)   {          
  
  $voting_channel_name_positive = 'vote+' . $user_id . '+positive';
  $voting_channel_name_negative = 'vote+' . $user_id . '+negative'; 
  
   //check if channels already exist (returning channel's id)
  $existing_positive_channel_id = get_channel_id($dbconn, $voting_channel_name_positive);
  $existing_negative_channel_id = get_channel_id($dbconn, $voting_channel_name_negative);

// check positive and negative voting channels
if ($existing_positive_channel_id && $existing_negative_channel_id) {
    $voting_channel_data = array();
    $voting_channel_data[] = $existing_positive_channel_id;
    $voting_channel_data[] = $existing_negative_channel_id;
    $voting_channel_data[] = $user_id;

    return $voting_channel_data;

} else if (!$existing_positive_channel_id && !$existing_negative_channel_id) {

    //add voting channels   
   $query = 'INSERT INTO channel (name, description, url, owner_id) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8) RETURNING channel.id';
   $result = pg_query_params($dbconn, $query, array($voting_channel_name_positive, $channel_data_array['description'], $channel_data_array['url'], $channel_data_array['owner_id'], $voting_channel_name_negative, $channel_data_array['description'], $channel_data_array['url'], $channel_data_array['owner_id']));

   $voting_channel_data = array();

   while($row = pg_fetch_row($result)){
   	$voting_channel_data[] = $row[0];
   }

   $voting_channel_data[] = $user_id;

return $voting_channel_data;
}

}


function write_tag_in_voting_channel($dbconn, $latitude, $longitude, $altitude, $added_ch_array, $vote) {

// select tag from DB
$query = "SELECT * FROM tag "; 
$query .= 'INNER JOIN channel ON tag.channel_id = channel.id ';
$query .= 'INNER JOIN subscribe ON channel.id = subscribe.channel_id ';
$query .= 'INNER JOIN users ON subscribe.user_id=users.id ';
$query .= "WHERE tag.latitude = ${latitude} AND tag.longitude = ${longitude}
 AND tag.altitude = ${altitude} AND users.id='91'";

if (!pg_query($dbconn, $query)) {
    send_error(1, "Can't select tag");
    die();
} else {
   $result = pg_query($dbconn, $query);
}

$row = pg_fetch_row($result);

    $tag_data_array = array();
    $tag_data_array['time'] = $row[1];
    $tag_data_array['altitude'] = $row[2];
    $tag_data_array['latitude'] = $row[3];
    $tag_data_array['longitude'] = $row[4];
    $tag_data_array['label'] = $row[5];
    $tag_data_array['description'] = $row[6];
    $tag_data_array['url'] = $row[7];
    $tag_data_array['user_id'] = $added_ch_array[2];

    $tag_user_id = $added_ch_array[2];

     if ($vote == POSITIVE_VOTE) {
         $tag_channel_id = $added_ch_array[0];
         $tag_data_array['channel_id'] = $tag_channel_id;
     }
     else if ($vote == NEGATIVE_VOTE) {
        $tag_channel_id = $added_ch_array[1];
        $tag_data_array['channel_id'] = $tag_channel_id;
     }


//check if this tag already voted in $added_ch_id channel
$query_check = "SELECT * FROM tag "; 
$query_check .= 'INNER JOIN channel ON tag.channel_id = channel.id ';
$query_check .= 'INNER JOIN subscribe ON channel.id = subscribe.channel_id ';
$query_check .= 'INNER JOIN users ON subscribe.user_id = users.id ';
$query_check .= "WHERE tag.latitude = ${latitude} AND tag.longitude = ${longitude}
 AND tag.altitude = ${altitude} AND tag.channel_id = ${tag_channel_id} AND channel.owner_id = ${tag_user_id}";


if (!pg_query($dbconn, $query_check)) {
    send_error(1, "Can't check tag");
    die();
} else {
   $check_result = pg_query($dbconn, $query_check);
}

$row = pg_fetch_row($check_result);

// If point already voted 
if ($row) {
    $voted='already voted';
    return $voted;
}

// write tag in voting channel (if has't already added)

$db_insert_tag=safe_pg_insert($dbconn, 'tag', $tag_data_array);

if (!$db_insert_tag) {
    send_error(1, "Can't write new tag");
    die();
}

$voted='voted first';

return $voted;

}


function change_vote($dbconn, $latitude, $longitude, $altitude, $added_ch_array, $vote) {

// select tag from DB
$query = "SELECT * FROM tag "; 
$query .= 'INNER JOIN channel ON tag.channel_id = channel.id ';
$query .= 'INNER JOIN subscribe ON channel.id = subscribe.channel_id ';
$query .= 'INNER JOIN users ON subscribe.user_id=users.id ';
$query .= "WHERE tag.latitude = ${latitude} AND tag.longitude = ${longitude}
 AND tag.altitude = ${altitude} AND users.id='91'";

if (!pg_query($dbconn, $query)) {
    send_error(1, "Can't select tag");
    die();
} else {
   $result = pg_query($dbconn, $query);
}

$row = pg_fetch_row($result);

    $tag_data_array = array();
    $tag_data_array['time'] = $row[1];
    $tag_data_array['altitude'] = $row[2];
    $tag_data_array['latitude'] = $row[3];
    $tag_data_array['longitude'] = $row[4];
    $tag_data_array['label'] = $row[5];
    $tag_data_array['description'] = $row[6];
    $tag_data_array['url'] = $row[7];
    $tag_data_array['user_id'] = $added_ch_array[2];

    $tag_user_id = $added_ch_array[2];

//return $tag_user_id;
//change vote (delete point from this channel and write in another one)

 if ($vote == POSITIVE_VOTE) {
         $old_voting_channel_id = $added_ch_array[1];
         $new_voting_channel_id = $added_ch_array[0];
         $tag_data_array['channel_id'] = $new_voting_channel_id;

     }
     else if ($vote == NEGATIVE_VOTE) {
        $old_voting_channel_id = $added_ch_array[0];
        $new_voting_channel_id = $added_ch_array[1];
        $tag_data_array['channel_id'] = $new_voting_channel_id;
     }

// delete tag from $old_tag_channel_id
$query_delete = "DELETE FROM tag WHERE tag.channel_id = ${old_voting_channel_id} AND tag.latitude = ${tag_data_array['latitude']} AND tag.longitude = ${tag_data_array['longitude']}
AND tag.altitude = ${tag_data_array['altitude']} AND tag.user_id = ${tag_user_id}";

if (!pg_query($dbconn, $query_delete)) {
     send_error(1, "Can't delete tag");
     die();
} 
else {
    $delete_result = pg_query($dbconn, $query_delete);
}


// write tag in another voting channel
$db_insert_tag=safe_pg_insert($dbconn, 'tag', $tag_data_array);

if (!$db_insert_tag) {
     send_error(1, "Can't write new tag");
     die();
}
  $voted='vote changed';

  return $voted;

}


function delete_vote($dbconn, $latitude, $longitude, $altitude, $channel_arr){

$tag_channel_id = $channel_arr[0];
$tag_user_id = $channel_arr[1];

// delete tag from voting channel
$query = "DELETE FROM tag WHERE tag.channel_id = ${tag_channel_id} "; 
$query .= "AND tag.user_id = ${tag_user_id} AND tag.latitude = ${latitude} ";
$query .= "AND tag.longitude = ${longitude} AND tag.altitude = ${altitude}";

if (!pg_query($dbconn, $query)) {
    send_error(1, "Can't delete tag");
    die();
} else {
   $delete_result = 'deleted';
   return $delete_result;
}

}



function subscribe_voting_channel($dbconn, $channel_id) {

 $query = 'INSERT INTO subscribe (channel_id, user_id)
    SELECT channel.id as ins_channel_id, users.id as ins_user_id
    FROM channel CROSS JOIN users
    WHERE channel.id=$1
          AND users.login=$2
          AND NOT EXISTS (
            SELECT subscribe.channel_id from subscribe
            INNER JOIN users ON users.id = subscribe.user_id
            INNER JOIN channel ON channel.id = subscribe.channel_id
            WHERE users.login=$2
                AND channel.id=$1
          )
          RETURNING 1;';

    $result = pg_query_params($dbconn, $query, array($channel_id, GEO2TAG_USER));
    
    if (!$result) {
        send_error(1, "Can't subscribe admin on voting_channel");
	 die();
    }
 return 'subscribed';
}

?>
