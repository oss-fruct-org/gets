<?php

function form_request($params) {
    $xml_request = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml_request .= '<request><params>';
    $xml_request .= $params;
    $xml_request .= '</params></request>';
    return $xml_request;
}

?>