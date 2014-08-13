<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$str=   '<div id="tracks-main-page" class="tracks-container hidden">
            <div class="tracks-container-inner-content">
                <div class="tracks-edit-input-item">
                    <input id="tracks-main-search-input" class="line-input-width-fit search-input" type="search"/>            
                </div>
                <div class="main-block">
                    <ul id="tracks-list" class="main-list">
                    </ul>            
                </div>
            </div>
            <div class="toolbar">';
if (isset($_SESSION['g2t_token'])) {
    $str.=      '<a id="tracks-main-add" class="two-button-toolbar-button-container" href="#form=add_track">
                    <img class="toolbar-button-icon" src="images/icons/add.png" alt="Add track">
                </a>
                <div id="tracks-main-update" class="two-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/update.png" alt="Update tracks">
                </div>';
} else {
    $str.=      '<div id="tracks-main-update" class="one-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/update.png" alt="Update tracks">
                </div>';
}
                
$str.=      '</div>
        </div>';


echo $str;

?>