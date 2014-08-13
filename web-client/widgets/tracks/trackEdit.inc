<?php

echo    '<div id="tracks-edit-track-page" class="tracks-container hidden">
            <div id="tracks-edit-track-back-button" class="back-button-continer">
                <img class="back-button-icon" src="images/icons/back.png" alt="Back">
            </div>
            <div class="tracks-container-inner-content">
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-track-name-input" class="label-column">Name</label>
                    <input id="tracks-edit-track-name-input" class="line-input-width-fit" type="text"/>            
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-track-desc-input" class="label-column">Description</label>
                    <textarea id="tracks-edit-track-desc-input" class="textarea-width-fit"></textarea>            
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-track-url-input" class="label-column">Url</label>
                    <input id="tracks-edit-track-url-input" class="line-input-width-fit" type="url" />            
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-track-lang-input" class="label-column">Language</label>
                    <select id="tracks-edit-track-lang-input" size="1">
                        <option value="en_US">English en_US</option>
                        <option value="ru_RU">Russian ru_RU</option>
                    </select>
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-track-category-input" class="label-column">Category</label>
                    <select id="tracks-edit-track-category-input" size="1">
                    </select>
                </div>
            </div>
            <div class="toolbar">
                <div id="tracks-edit-track-save" class="one-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/save.png" alt="Save track">
                </div>           
            </div>
        </div>';

?>