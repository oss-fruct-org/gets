<?php
    require_once('../config.php');

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
    $result = array();
    $pointsFile = "points.txt";
    
    if (defined('GHPATH') && defined('GHSOURCE')) {
	//echo "java -jar " . GHPATH . " " . $fromLat . " " . $fromLng . " " . $toLat . " " . $toLng . " " . $disability . " " . $pointsFile . " " . GHSOURCE;
	exec("java -jar " . GHPATH . " " . $fromLat . " " . $fromLng . " " . $toLat . " " . $toLng . " " . $disability . " " . $pointsFile . " " . GHSOURCE, $result);
    }
    //echo var_dump($result);
    echo $result[0];
?>