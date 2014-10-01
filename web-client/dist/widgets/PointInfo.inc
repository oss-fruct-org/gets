<?php

echo    '<div id="point-info-page" class="action-menu-container hidden">
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="point-info-edit" class="btn btn-default" title="Edit point" role="button">
                            <span class="glyphicon glyphicon-pencil"></span> Edit point 
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="point-info-remove" class="btn btn-danger" href="#" title="Remove point" role="button">
                            <span class="glyphicon glyphicon-remove"></span> Remove point 
                        </a>
                    </div>
                </div>
            </div>
            <div class="action-menu-inner-content">
                <div id="point-info-name" class="main-block font-big width-three-fourth ellipsis-text inline"></div>               
                <!--<div id="point-info-map" class="button-w-icon" title="Show on map">
                    <img src="images/icons/map.png" alt="Show on map">
                </div>-->
                <div id="point-info-coords" class="main-block"></div>
                <div id="point-info-image" class="main-block">
                    <img class="info-image" alt="No image">
                </div>
                <div id="point-info-description" class="main-block"></div>
                <div id="point-info-url" class="main-block">
                    <a target="_blank"></a>                 
                </div>
                <div id="point-info-audio" class="main-block">
                    <!--<audio controls>
                    </audio>-->                
                </div>
            </div>            
        </div>';

?>