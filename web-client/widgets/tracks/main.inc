<?php

echo   '<div id="tracks-main-page" class="tracks-container hidden">
            <div id="tracks-main-overlay" class="busy-overlay busy-overlay-hidden"></div>
            <div class="toolbar">
                <a id="tracks-main-add" class="two-button-toolbar-button-container" href="#form=add_track" title="Add track">
                    <img class="toolbar-button-icon" src="images/icons/add.png" alt="Add track">
                </a>
                <div id="tracks-main-update" class="two-button-toolbar-button-container" title="Update tracks">
                    <img class="toolbar-button-icon" src="images/icons/update.png" alt="Update tracks">
                </div>             
            </div>
            <div class="bordered-element">
                <div class="main-block-out-inner-content">
                    <input id="tracks-main-search-input" class="line-input-width-fit search-input" type="search"/>            
                </div>
                <div class="main-block-out-inner-content">
                    <label for="tracks-main-filter-category">Filter by category: </label>
                    <select id="tracks-main-filter-category" name="category" size="1"></select>            
                </div>
            </div>
            <div class="tracks-container-inner-content">               
                <div class="main-block">
                    <ul id="tracks-list" class="main-list">
                    </ul>            
                </div>
            </div>
        </div>';

?>