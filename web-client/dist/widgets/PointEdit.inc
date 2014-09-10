<?php

echo    '<div id="edit-point-page" class="action-menu-container hidden">
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
                        <label class="control-label">Coordinates * </label> 
                        <button id="edit-point-use-map" type="button" class="btn btn-default" title="Show on map">
                            <span class="glyphicon glyphicon-globe"></span> 
                        </button>
                        <div class="col-md-12">
                            <div class="form-group row">
                                <div class="col-md-6">
                                    <label for="edit-point-lat-input" class="control-label">Latitude</label>                                               
                                    <input id="edit-point-lat-input" name="latitude" type="text" class="form-control" value="0.0" required">
                                </div>
                                <div class="col-md-6">
                                    <label for="edit-point-lon-input" class="control-label">Longitude</label>                                               
                                    <input id="edit-point-lon-input" name="longitude" type="text" class="form-control" value="0.0" required">
                                </div>
                                <input id="edit-point-alt-input" name="altitude" type="hidden" value="0" required">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-picture-input">Picture</label>
                        <button type="button" class="btn btn-default btn-xs" data-toggle="popover" title="Data upload" data-content="ddddd" data-container="#edit-point-page" data-placement="right" data-trigger="focus">
                            <span class="glyphicon glyphicon-question-sign"></span>
                        </button>
                        <div class="input-group">
                            <input id="edit-point-picture-input" class="form-control" name="picture" type="file" accept="image/*" />
                            <span class="input-group-btn">
                                <button id="edit-point-picture-input-clear" class="btn btn-default" type="button">
                                    <span class="glyphicon glyphicon-remove"></span> Clear 
                                </button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-audio-input">Audio track</label>
                        <div class="input-group">
                            <input id="edit-point-audio-input" class="form-control" name="audio" type="file" accept="audio/*" /> 
                            <span class="input-group-btn">
                                <button id="edit-point-audio-input-clear" class="btn btn-default" type="button">
                                    <span class="glyphicon glyphicon-remove"></span> Clear 
                                </button>
                            </span>
                        </div>
                    </div>
                    <p>* - Required fields</p>
                </div>              
            </form>           
        </div>';
?>