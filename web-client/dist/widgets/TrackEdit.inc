<?php

echo    '<div id="tracks-edit-track-page" class="action-menu-container hidden">
            <div id="tracks-edit-track-overlay" class="busy-overlay"></div>
            <form id="tracks-edit-track-form" action="javascript:void(null);" role="form">
                <div class="action-menu-toolbar-container">
                    <div class="btn-group btn-group-justified">
                        <div class="btn-group">
                            <button id="tracks-edit-track-save" type="submit" class="btn btn-success">
                                <span class="glyphicon glyphicon-ok"></span> Ok 
                            </button>
                        </div>
                    </div>
                </div>
                <div class="action-menu-inner-content">
                    <div class="form-group">
                        <label for="tracks-edit-track-name-input">Name *</label>
                        <input id="tracks-edit-track-name-input" class="form-control" name="hname" type="text" required/>            
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-desc-input">Description</label>
                        <textarea id="tracks-edit-track-desc-input" class="form-control" name="description"></textarea>            
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-url-input">Url</label>
                        <input id="tracks-edit-track-url-input" class="form-control" name="url" type="url" />            
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-category-input">Category</label>
                        <select id="tracks-edit-track-category-input" class="form-control" name="category_id" size="1"></select>
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-lang-input">Language</label>
                        <select id="tracks-edit-track-lang-input" class="form-control" name="lang" size="1">
                            <option value="en_US">English en_US</option>
                            <option value="ru_RU">Russian ru_RU</option>
                        </select>
                    </div>
                    <p>* - Required fields</p>
                </div>
            </form>
        </div>';

?>