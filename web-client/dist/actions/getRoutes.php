<?php
    require_once('../config.php');
    require_once('utils/array2xml.inc');
    require_once('utils/process_request.inc');
    require_once('utils/methods_url.inc');

    if (!isset($_SERVER["HTTP_HOST"])) {
	parse_str($argv[1], $_GET);
	  parse_str($argv[1], $_POST);
    }

    $routeCoords = json_decode($_POST['routeCoords']);
    $fromLat = $routeCoords->fromLat;
    $fromLng = $routeCoords->fromLng;
    $toLat = $routeCoords->toLat;
    $toLng = $routeCoords->toLng;
    $disability = $routeCoords->disability;
   /* $fromLat = 61.785328;
    $fromLng = 34.347391;
    $toLat = 61.789176;
    $toLng = 34.354344;
    $disability = 1;*/
    
    // download attractions to temporary file
    $post_data_array = array();
    $post_data_array['latitude'] = ($fromLat + $toLat)/2;
    $post_data_array['longitude'] = ($fromLng + $toLng)/2;
    $post_data_array['radius'] = 3; // magic
    if (isset($_SESSION['g2t_token'])) {
        $auth_token_array = array();
        $auth_token_array['auth_token'] = $_SESSION['g2t_token'];
        $combined_array = array_merge($auth_token_array, $post_data_array);
    } else {
	$combined_array = $post_data_array;
    }
    $data = array2xml($combined_array, 'params', false);
    $pointsFile = tempnam(sys_get_temp_dir(), "points");
    $pointsInXML = process_request(LOAD_POINTS_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml');
    $xml = simplexml_load_string($pointsInXML);
    $pointsArray = array();
    foreach ($xml->content->kml->Document->Placemark as $placemark) {
        $placemark->registerXPathNamespace('c', 'http://www.opengis.net/kml/2.2');
	$coords = explode(',', $placemark->Point->coordinates);
	//var_dump((string)$placemark->xpath("c:ExtendedData/c:Data[@name='rating']")[0]->value[0]);
	//exit;
	$props['difficulty'] = (string)($placemark->xpath("c:ExtendedData/c:Data[@name='rating']")[0]->value[0]);
	$props['lat'] = $coords[1];
	$props['lng'] = $coords[0];
	$props['uuid'] = (string)$placemark->xpath("c:ExtendedData/c:Data[@name='uuid']")[0]->value[0];
	$props['category_id'] = (string)$placemark->xpath("c:ExtendedData/c:Data[@name='category_id']")[0]->value[0];
	if ($props['difficulty'] == "") {
	    $props['difficulty'] = "0";
	}
	array_push($pointsArray, $props);
    }
    $json = json_encode($pointsArray);
    file_put_contents($pointsFile, $json);
    //echo $json;

    $result = array();
    
    if (defined('GHPATH') && defined('GHSOURCE')) {
	//echo "java -jar " . GHPATH . " " . $fromLat . " " . $fromLng . " " . $toLat . " " . $toLng . " " . $disability . " " . $pointsFile . " " . GHSOURCE;
	exec("java -jar " . GHPATH . " " . $fromLat . " " . $fromLng . " " . $toLat . " " . $toLng . " " . $disability . " " . $pointsFile . " " . GHSOURCE, $result);
    }
    //echo var_dump($result);
    echo $result[0];
