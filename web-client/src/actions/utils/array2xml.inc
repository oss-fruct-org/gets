<?php

/**
 * Function returns XML string for input associative array.
 * @param Array $array Input associative array
 * @param String $wrap Wrapping tag
 * @param Boolean $upper To set tags in uppercase
 */
function array2xml($array, $wrap='params') {
    // set initial value for XML string
    $xml = '';
    // wrap XML with $wrap TAG
    if ($wrap != null) {
        $xml .= "<$wrap>\n";
    }
    // main loop
    traversArray($array, $xml);

    // close wrap TAG if needed
    if ($wrap != null) {
        $xml .= "\n</$wrap>\n";
    }
    // return prepared XML string
    return $xml;
}

function traversArray($array, &$xml) {
    foreach ($array as $key=>$value) {
        if (is_array($value)) {
            $xml .= "<$key>";
            traversArray($value, $xml);
            $xml .= "</$key>";
        } else {
            // append to XML string
            $xml .= "<$key>" . $value . "</$key>";
        }
    }
}

?>