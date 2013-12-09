<?php
include_once('process_request.php');
include_once('methods_url.php');

//$data = '{"auth_token":"7c26751e47d0b181846928ed5188738c", "name":"hostels", "description":"{\"description\":\"A channel for store hostels\", \"category\":\"hostels\"}", "url":"http://www.ticrk.ru", "activeRadius":1000}';
//$data = '{"auth_token":"7c26751e47d0b181846928ed5188738c"}';
//$data = '{"auth_token":"7c26751e47d0b181846928ed5188738c", "channel":"hostels"}';
/*$data = '<?xml version="1.0" encoding="UTF-8"?><request><params><auth_token>7c26751e47d0b181846928ed5188738c</auth_token><latitude>33.0</latitude><longitude>66.0</longitude><radius>500</radius><category_name>sights</category_name></params></request>';*/
$data = '<?xml version="1.0" encoding="UTF-8"?><request><params><auth_token>7c26751e47d0b181846928ed5188738c</auth_token><latitude>34.8083</latitude><longitude>64.5113</longitude><radius>100</radius><category_name>sights</category_name></params></request>';
//34.8083,64.5113
/*$data = '<?xml version="1.0" encoding="UTF-8"?><request><params><auth_token>7c26751e47d0b181846928ed5188738c</auth_token></params></request>';*/

header ('Content-Type:text/xml');
echo process_request('http://kappa.cs.karelia.ru/~davydovs/gets/loadPoints.php', $data, /*'Content-Type:application/json'*/'Content-Type: text/xml');
?>