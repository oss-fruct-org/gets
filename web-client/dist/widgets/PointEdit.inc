<?php

echo    '<div id="edit-point-page" class="tracks-container hidden">
            <div id="edit-point-overlay" class="busy-overlay"></div>
            <form id="edit-point-form" action="javascript:void(null);" role="form">
                <div class="action-menu-toolbar-container">
                    <div class="btn-group btn-group-justified">
                        <div class="btn-group">
                            <button id="edit-point-save" type="submit" class="btn btn-success">
                                <span class="glyphicon glyphicon-ok"></span> Ok 
                            </button>
                        </div>
                    </div>
                </div>
                <div class="action-menu-inner-content">
                    <div class="form-group">
                        <label for="edit-point-name-input">Name *</label>
                        <input id="edit-point-name-input" class="form-control" name="title" type="text" required/>            
                    </div>
                    <div class="form-group">
                        <label for="edit-point-desc-input">Description</label>
                        <textarea id="edit-point-desc-input" class="form-control" name="description"></textarea>            
                    </div>
                    <div class="form-group">
                        <label for="edit-point-url-input">Url</label>
                        <input id="edit-point-url-input" class="form-control" name="url" type="url" />            
                    </div>                   
                    <div class="form-group">
                        <label for="tracks-edit-point-coords-input">
                            Coordinates *
                        </label>
                        <button id="edit-point-use-map" type="button" class="btn btn-default" title="Show on map">
                            <span class="glyphicon glyphicon-globe"></span> 
                        </button>                        
                        <div class="coords-input-container">
                            <div class="coords-input-item">
                                <label for="edit-point-lat-input">Latitude</label>
                                <input id="edit-point-lat-input" class="form-control" name="latitude" type="text" value="0.0" required/>
                            </div>
                            <div class="coords-input-item">
                                <label for="edit-point-lon-input">Longitude</label>
                                <input id="edit-point-lon-input" class="form-control" name="longitude" type="text" value="0.0" required/>
                            </div>                            
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-picture-input">Picture</label>
                        <input id="edit-point-picture-input" class="form-control" name="picture" type="file" accept="image/*" />
                        <button id="edit-point-picture-input-clear" class="btn btn-danger" type="button">
                            <span class="glyphicon glyphicon-remove"></span> Clear 
                        </button>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-audio-input">Audio track</label>
                        <input id="edit-point-audio-input" class="form-control" name="audio" type="file" accept="audio/*" /> 
                        <button id="edit-point-audio-input-clear" class="btn btn-danger" type="button">
                            <span class="glyphicon glyphicon-remove"></span> Clear 
                        </button>
                    </div>
                    <p>* - Required fields</p>
                </div>              
            </form>           
        </div>';
?>