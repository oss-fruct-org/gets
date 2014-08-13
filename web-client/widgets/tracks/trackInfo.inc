<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$str =  '<div id="tracks-info-page" class="tracks-container hidden">
            <div id="tracks-info-back-button" class="back-button-continer">                
                <img class="back-button-icon" src="images/icons/back.png" alt="Back">
            </div>
            <div class="tracks-container-inner-content">
                <div id="tracks-info-name" class="main-block big-text fixed-height-container-small overflow-auto width-three-fourths">                   
                </div>
                <div id="tracks-info-map" class="button-w-icon">
                    <img src="images/icons/map.png" alt="Show on map">
                </div>
                <div id="tracks-info-description" class="main-block">                    
                </div>
                <div class="main-block">
                    <ul id="tracks-points-list" class="main-list">
                    </ul>
                </div>
            </div>';
if (isset($_SESSION['g2t_token'])) {
    $str .= '<div class="toolbar">
                <div id="tracks-info-add" class="three-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/add.png" alt="Add point">
                </div>
                <div id="tracks-info-edit" class="three-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/edit.png" alt="Edit track">
                </div>
                <div id="tracks-info-remove" class="three-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/remove.png" alt="Remove track">
                </div>
            </div>';
}

$str .= '</div>';

echo $str;

?>