<?php

echo    '<div id="point-info-page" class="action-menu-container hidden" data-pagetitle="' . getString('point-info-title','Point Info') . '" data-messagesuccess-remove="' . getString('point-remove-success','Point was successfully removed') . '" data-putpoint="' . getString('put-point-in-point-info','Put point into the «Point Info» window') . '">
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="point-info-edit" class="btn btn-default" title="' . getString('edit-point','Edit point') . '" role="button">
                            <span class="glyphicon glyphicon-pencil"></span> ' . getString('edit-point','Edit point') . ' 
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="point-info-remove" class="btn btn-danger" href="#" title="' . getString('remove-point','Remove point') . '" role="button" data-removetext="' . getString('point-remove-text','Are you sure you want to remove this point? (This action cannot be cancelled.)') . '">
                            <span class="glyphicon glyphicon-remove"></span> ' . getString('remove-point','Remove point') . ' 
                        </a>
                    </div>
                </div>
            </div>
            <div class="action-menu-inner-content">              
                <div id="point-info-name" class="main-block font-big height-half"></div>               
                <!--<div id="point-info-map" class="button-w-icon" title="Show on map">
                    <img src="images/icons/map.png" alt="Show on map">
                </div>-->
                <div class="main-block">
                    <label>' . getString('coordinates','Coordinates') . '</label>
                    <div class="emulate-tab"><label>' . getString('latitude','Latitude') . ': &nbsp;</label><div id="point-info-coords-lat" class="inline"></div></div>
                    <div class="emulate-tab"><label>' . getString('longitude','Longitude') . ': &nbsp;</label><div id="point-info-coords-lon" class="inline"></div></div>
                    <div class="emulate-tab"><label>' . getString('altitude','Altitude') . ': &nbsp;</label><div id="point-info-coords-alt" class="inline"></div></div>    
                </div>
                <div class="main-block">
                    <label for="point-info-image">' . getString('picture','Picture') . '</label>
                    <div id="point-info-image">
                        <img class="info-image" alt="' . getString('no-image','No image') . '">
                    </div>
                </div>
                <div class="main-block">
                    <label for="point-info-description">' . getString('description','Description') . '</label>
                    <div id="point-info-description"></div>
                </div>
                <div class="main-block">
                    <label for="point-info-url">' . getString('url','Link') . '</label>
                    <div id="point-info-url">
                        <a target="_blank"></a>                 
                    </div>
                </div> 
                <div class="main-block">
                    <label for="point-info-audio">' . getString('audio-track','Audio track') . '</label>
                    <div id="point-info-audio">
                        <!--<audio controls>
                        </audio>-->                
                    </div>
                </div>
                <div class="main-block">
                    <label for="point-info-audio">' . getString('extended-data', 'Extended data') . '</label>
                    <div id="point-info-extended-data">               
                    </div>
                </div>
            </div>            
        </div>';

?>