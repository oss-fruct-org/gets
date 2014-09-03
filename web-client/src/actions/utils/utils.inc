<?php

include_once('methods_url.inc');

function form_request($params) {
    $xml_request = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml_request .= '<request><params>';
    $xml_request .= $params;
    $xml_request .= '</params></request>';
    return $xml_request;
}


function process_request($method, $data, $content_type) {
    /* Initialize and configure curl request */
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HTTPHEADER, array($content_type));
    curl_setopt($ch, CURLOPT_URL, $method);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    /* Execute request and send result to the client */
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo curl_error($ch);
        return;
    } else {
        curl_close($ch);
        return $result;
    }
}

function getCategoriesAsArray($token) {
    $data = form_request('<auth_token>' . $token . '</auth_token>');
    $response = process_request(GET_CATEGORIES_METHOD_URL, $data, 'Content-Type: text/xml');
    if (!$response) {
        die('Error: NULL response from GeTS.');
    }
    $dom = new DOMDocument();
    $dom->loadXML($response);

    if (!$dom) {
        die('Error: resource isn\'t XML document.');
    }
    
    if ($dom->getElementsByTagName('code')->item(0)->nodeValue == 0) {
        $categories_array = array();
        $categories = $dom->getElementsByTagName('category');
        $k = 0;
        foreach ($categories as $category) {
            $categories_array[$k]['id'] = htmlspecialchars($category->getElementsByTagName('id')->item(0)->nodeValue);
            $categories_array[$k]['name'] = htmlspecialchars($category->getElementsByTagName('name')->item(0)->nodeValue);
            $categories_array[$k]['description'] = htmlspecialchars($category->getElementsByTagName('description')->item(0)->nodeValue);
            $categories_array[$k]['url'] = htmlspecialchars($category->getElementsByTagName('url')->item(0)->nodeValue);
            $k++;
        }
        return $categories_array;
    } else {
        return null;
    }
}

function getPointsAsArray($token, $space, $latitude = NULL, $longitude = NULL, $radius = NULL, $category = -1) {
    $location_condition = !is_null($latitude) && !is_null($longitude) && !is_null($radius);
    $category_condition = $category != -1;
    
    if (!$location_condition && !$category_condition) {
        return NULL;
    }
    
    $params = '<auth_token>' . $token . '</auth_token>';
    if ($location_condition && $category_condition) {
        $params .= '<latitude>' . $longitude . '</latitude>';
        $params .= '<longitude>' . $latitude . '</longitude>';
        $params .= '<radius>' . $radius . '</radius>';
        $params .= '<category_id>' . $category . '</category_id>';
        $params .= '<space>' . $space . '</space>';
    } elseif ($location_condition) {
        $params .= '<latitude>' . $longitude . '</latitude>';
        $params .= '<longitude>' . $latitude . '</longitude>';
        $params .= '<radius>' . $radius . '</radius>';
        $params .= '<space>' . $space . '</space>';
    } else {
        $params .= '<category_id>' . $category . '</category_id>';
        $params .= '<space>' . $space . '</space>';
    }      
    $data = form_request($params);
    //echo $data;
    $response = process_request(LOAD_POINTS_METHOD_URL, $data, 'Content-Type: text/xml');
    if (!$response) {
        die('Error: NULL response from GeTS.');
    }
    $dom = new DOMDocument();
    $dom->loadXML($response);

    if (!$dom) {
        die('Error: resource isn\'t XML document.');
    }
    
    //echo $dom->saveXML();
    
    if ($dom->getElementsByTagName('code')->item(0)->nodeValue == 0) {
        $points_array = array();
        $points = $dom->getElementsByTagName('Placemark');
        $k = 0;
        foreach ($points as $point) {
            $points_array[$k]['name'] = htmlspecialchars($point->getElementsByTagName('name')->item(0)->nodeValue);
            $points_array[$k]['description'] = $point->getElementsByTagName('description')->item(0)->nodeValue;
            $points_array[$k]['coords'] = $point->getElementsByTagName('coordinates')->item(0)->nodeValue;
            $k++;
        }
        return $points_array;
    } else {
        return NULL;
    }
}

?>