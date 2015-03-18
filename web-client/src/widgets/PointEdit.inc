<?php

echo    '<div id="edit-point-page" class="action-menu-container hidden" data-pagetitle-add="' . getString('add-point-title','Add Point') . '" data-pagetitle-edit="' . getString('edit-point-title','Edit Point') . '" data-messagesuccess-add="' . getString('point-add-success','Point was successfully added') . '" data-messagesuccess-edit="' . getString('point-edit-success','Point was successfully edited') . '">
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
                        <label for="edit-point-name-input">' . getString('name','Name') . ' *</label>
                        <input id="edit-point-name-input" class="form-control" name="title" type="text" required />            
                    </div>
                    <div class="form-group">
                        <label for="edit-point-desc-input">' . getString('description','Description') . '</label>
                        <div>
                            <!--<div><label><input id="edit-point-desc-input-raw-check" type="checkbox" /> Raw JSON</label><label><input id="edit-point-desc-input-keyvalue-check" type="checkbox" /> Key-Value input</label></div>-->
                            <textarea id="edit-point-desc-input" class="form-control" name="description"></textarea>
                            <!--<div id="edit-point-desc-input-keyvalue"></div>-->
                        </div>    
                    </div>
                    <div class="form-group">
                        <label for="edit-point-url-input">' . getString('url','Url') . '</label>
                        <input id="edit-point-url-input" class="form-control" name="url" type="url" />            
                    </div>
                    <div class="form-group hidden">
                        <label for="edit-point-category-input">' . getString('category','Category') . '</label>
                        <select id="edit-point-category-input" class="form-control" name="category" size="1"></select>
                    </div> 
                    <div class="form-group">
                        <label class="control-label">' . getString('coordinates','Coordinates') . ' * </label>
                        <div class="btn-group">
                            <button id="edit-point-use-map" class="btn btn-default btn-sm" type="button">
                                <span class="glyphicon glyphicon-map-marker"></span> ' . getString('use-map','Use map') . '
                            </button> 
                            <button class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" type="button">
                                &nbsp; <span class="caret"></span> &nbsp;
                            </button>
                            <ul id="edit-point-use-map-settings" class="dropdown-menu" role="menu">           
                                <li><a href="#" role="button" class="btn-sm marked-list-item" data-item="center">' . getString('center-map', 'Center of the map') . '</a></li>
                                <li><a href="#" role="button" class="btn-sm" data-item="location">' . getString('my-location', 'My location') . '</a></li>    
                            </ul>
                        </div> 
                        <div class="top-margin"></div>
                        <label for="edit-point-lat-input" class="control-label">' . getString('latitude','Latitude') . ', ' . getString('longitude','Longitude') . '</label>
                        <div class="input-group add-on top-margin">            
                            <div class="input-group-btn">
                                <div class="dropdown">
                                    <button id="edit-point-coords-change-input" class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown"> 
                                         &nbsp;<span class="glyphicon glyphicon-transfer"></span>
                                    </button>
                                    <ul id="edit-point-coords-input-type" class="dropdown-menu" role="menu">
                                        <li><a href="#" role="button" class="btn-sm marked-list-item" data-item="decimal" data-title="' . getString('coords-dd', 'DD') . '">' . getString('coords-input-type-decimal', 'Degree decimal') . '</a></li>
                                        <li><a href="#" role="button" class="btn-sm" data-item="degrees-m" data-title="' . getString('coords-dd-mm', 'DD MM') . '">' . getString('coords-input-type-degrees-m', 'Degree, minutes') . '</a></li>  
                                        <li><a href="#" role="button" class="btn-sm" data-item="degrees-m-s" data-title="' . getString('coords-dd-mm-ss', 'DD MM SS') . '">' . getString('coords-input-type-degrees-m-s', 'Degree, minutes, seconds') . '</a></li>    
                                    </ul>
                                </div>
                            </div>
                            <input id="edit-point-lat-lon-input" type="text" class="form-control" aria-describedby="edit-point-coords-change-input"/>
                            <input id="edit-point-alt-input" name="altitude" type="hidden" value="0.0" required>
                        </div>  
                    </div>
                    <div class="form-group">
                        <label for="edit-point-active-radius-input" class="block">' . getString('active-radius','Active radius (meters)') . ' *</label>
                        <div class="checkbox">
                            <label for="edit-point-radius-default" class="control-label">
                                <input id="edit-point-radius-default" type="checkbox" data-default-value="63"> ' . getString('use-default-value','Use default value') . '
                            </label>
                        </div>
                        <input id="edit-point-active-radius-input" name="radius" type="text" class="form-control" value="63" required />                       
                    </div>
                    <div class="form-group">
                        <label for="edit-point-picture-input">' . getString('picture','Picture') . '<br>' . getString('paste-url-or','Paste URL or') . ' <a id="edit-point-picture-toggle-upload" href="#">' . getString('upload-file','upload file') . '</a></label>
                        <button type="button" class="btn btn-default btn-xs" data-toggle="popover" title="Data upload" data-content="ddddd" data-container="#edit-point-page" data-placement="right" data-trigger="focus">
                            <span class="glyphicon glyphicon-question-sign"></span>
                        </button>
                        <input id="edit-point-picture-input-url" name="photo" type="url" class="form-control">
                        <br>
                        <div id="edit-point-picture-upload" class="hidden">
                            <input id="edit-point-picture-input-file" class="form-control" type="file" accept="image/*" /> 
                            <div class="btn-group btn-group-justified">
                                <div class="btn-group">
                                    <button id="edit-point-picture-input-file-upload" class="btn btn-default disabled" type="button">
                                        <span class="glyphicon glyphicon-upload"></span> ' . getString('upload','Upload') . ' 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-picture-input-file-clear" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-trash"></span> ' . getString('clear','Clear') . ' 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-picture-input-file-cancel" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-remove"></span> ' . getString('close','Close') . ' 
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-audio-input">' . getString('audio-track','Audio track') . '<br>' . getString('paste-url-or','Paste URL or') . ' <a id="edit-point-audio-toggle-upload" href="#">' . getString('upload-file','upload file') . '</a></label>
                        <input id="edit-point-audio-input-url" name="audio" type="url" class="form-control">
                        <br>
                        <div id="edit-point-audio-upload" class="hidden">
                            <input id="edit-point-audio-input-file" class="form-control" type="file" accept="audio/*" /> 
                            <div class="btn-group btn-group-justified">
                                <div class="btn-group">
                                    <button id="edit-point-audio-input-file-upload" class="btn btn-default disabled" type="button">
                                        <span class="glyphicon glyphicon-upload"></span> ' . getString('upload','Upload') . ' 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-audio-input-file-clear" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-trash"></span> ' . getString('clear','Clear') . ' 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-audio-input-file-cancel" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-remove"></span> ' . getString('close','Close') . ' 
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="edit-point-extended-data">
                    </div>
                    <div class="form-group">
                        <div id="edit-point-add-field-open-button" class="btn-group btn-group-justified">
                            <div class="btn-group">
                                <button id="edit-point-add-field-open" type="button" class="btn btn-default">
                                    <span class="glyphicon glyphicon-plus-sign"></span> ' . getString('add-field','Add field') . '
                                </button>
                            </div>
                        </div>
                        <div class="bordered-element">
                            <div id="edit-point-add-field-input-box" class="hidden">
                                <div class="form-group">
                                    <label for="edit-point-add-field-input-name">' . getString('name','Name') . '</label>
                                    <input id="edit-point-add-field-input-name" class="form-control" type="text" placeholder="' . getString('enter-name','') . '"/>
                                </div>
                                <div class="form-group">        
                                    <label for="edit-point-add-field-input-value">' . getString('value','Value') . '</label>
                                    <input id="edit-point-add-field-input-value" class="form-control" type="text" placeholder="' . getString('enter-value','') . '"/> 
                                </div>        
                            </div>
                            <div id="edit-point-add-field-control-buttons" class="btn-group btn-group-justified hidden">
                                <div class="btn-group">
                                    <button id="edit-point-add-field-save" type="button" class="btn btn-default">
                                        <span class="glyphicon glyphicon-plus-sign"></span> ' . getString('add','Add') . '
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-add-field-cancel" type="button" class="btn btn-default">
                                        <span class="glyphicon glyphicon-remove-sign"></span> ' . getString('cancel','Cancel') . '
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>    
                    <p>* - ' . getString('required-fields','Required fields') . '</p>
                </div>              
            </form>           
        </div>';
?>