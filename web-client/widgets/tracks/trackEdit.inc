<?php

echo    '<div id="tracks-edit-track-page" class="tracks-container hidden">
            <div id="tracks-edit-track-overlay" class="busy-overlay busy-overlay-hidden"></div>
            <form id="tracks-edit-track-form" action="javascript:void(null);">
                <div class="toolbar">
                    <input id="tracks-edit-track-save" class="one-button-toolbar-button-container input-submit" type="submit" value="" />          
                </div>
                <div class="tracks-container-inner-content">
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-track-name-input" class="label-column">Name *</label>
                        <input id="tracks-edit-track-name-input" class="line-input-width-fit" name="hname" type="text" required/>            
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-track-desc-input" class="label-column">Description</label>
                        <textarea id="tracks-edit-track-desc-input" class="textarea-width-fit" name="description"></textarea>            
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-track-url-input" class="label-column">Url</label>
                        <input id="tracks-edit-track-url-input" class="line-input-width-fit" name="url" type="url" />            
                    </div>                    
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-track-category-input" class="label-column">Category</label>
                        <select id="tracks-edit-track-category-input" name="category_id" size="1">
                        </select>
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-track-lang-input" class="label-column">Language</label>
                        <select id="tracks-edit-track-lang-input" name="lang" size="1">
                            <option value="en_US">English en_US</option>
                            <option value="ru_RU">Russian ru_RU</option>
                        </select>
                    </div>
                    <p>* - Required fields</p>
                </div>
            </form>
        </div>';

?>