<?php

echo    '<div id="tracks-edit-track-page" class="action-menu-container hidden" data-pagetitle-add="' . getString('add-track-title','Add Track') . '" data-pagetitle-edit="' . getString('edit-track-title','Edit Track') . '" data-messagesuccess-add="' . getString('track-add-success','Track was successfully added') . '" data-messagesuccess-edit="' . getString('track-edit-success','Track was successfully edited') . '">
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
                        <label for="tracks-edit-track-name-input">' . getString('name','Name') . ' *</label>
                        <input id="tracks-edit-track-name-input" class="form-control" name="hname" type="text" required/>            
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-desc-input">' . getString('description','Description') . '</label>
                        <textarea id="tracks-edit-track-desc-input" class="form-control" name="description"></textarea>            
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-url-input">' . getString('url','Url') . '</label>
                        <input id="tracks-edit-track-url-input" class="form-control" name="url" type="url" />            
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-category-input">' . getString('category','Category') . '</label>
                        <select id="tracks-edit-track-category-input" class="form-control" name="category_id" size="1"></select>
                    </div>
                    <div class="form-group">
                        <label for="tracks-edit-track-lang-input">' . getString('language','Language') . '</label>
                        <select id="tracks-edit-track-lang-input" class="form-control" name="lang" size="1">
                            <option value="en_US">English en_US</option>
                            <option value="ru_RU">Russian ru_RU</option>
                        </select>
                    </div>
                    <p>* - ' . getString('required-fields','Required fields') . '</p>
                </div>
            </form>
        </div>';

?>