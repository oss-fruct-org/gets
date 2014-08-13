<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$str =  '<div id="tracks-point-info-page" class="tracks-container hidden">
            <div id="tracks-point-info-back-button" class="back-button-continer">
                <img class="back-button-icon" src="images/icons/back.png" alt="Back">
            </div>
            <div class="tracks-container-inner-content">
                <div id="tracks-point-info-name" class="main-block big-text fixed-height-container-small overflow-auto width-three-fourths">                   
                </div>               
                <div id="tracks-point-info-map" class="button-w-icon">
                    <img src="images/icons/map.png" alt="Show on map">
                </div>
                <div id="tracks-point-info-coords" class="main-block">                 
                </div>
                <div id="tracks-point-info-description" class="main-block">
                </div>
                <div id="tracks-point-info-url" class="main-block">
                    <a target="_blank"></a>                 
                </div>
                <div id="tracks-point-info-audio" class="main-block">
                    <audio controls>
                        <source src="" type="audio/mpeg">
                    </audio>                 
                </div>
            </div>';
if (isset($_SESSION['g2t_token'])) {
    $str .= '<div class="toolbar">
                <div id="tracks-point-info-edit" class="two-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/edit.png" alt="Edit point">
                </div>
                <div id="tracks-point-info-remove" class="two-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/remove.png" alt="Remove point">
                </div>
            </div>';
}

$str .= '</div>';

echo $str;

?>