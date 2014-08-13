<?php

echo    '<div id="tracks-edit-point-page" class="tracks-container hidden">
            <div id="tracks-edit-point-back-button" class="back-button-continer">
                <img class="back-button-icon" src="images/icons/back.png" alt="Back">
            </div>
            <div class="tracks-container-inner-content">
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-point-name-input" class="label-column">Name</label>
                    <input id="tracks-edit-point-name-input" class="line-input-width-fit" type="text"/>            
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-point-desc-input" class="label-column">Description</label>
                    <textarea id="tracks-edit-point-desc-input" class="textarea-width-fit"></textarea>            
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-point-url-input" class="label-column">Url</label>
                    <input id="tracks-edit-point-url-input" class="line-input-width-fit" type="url" />            
                </div>                
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-point-coords-input">
                        Coordinates
                    </label>
                    <div class="button-w-icon">
                        <img src="images/icons/map.png" alt="Use map">
                    </div>
                    <div class="coords-input-container">
                        <div class="coords-input-item">
                            <label for="tracks-edit-point-lat-input" class="label-column">Latitude</label>
                            <input id="tracks-edit-point-lat-input" class="line-input-width-fit" type="text" value="0.0"/>
                        </div>
                        <div class="coords-input-item">
                            <label for="tracks-edit-point-lon-input" class="label-column">Longitude</label>
                            <input id="tracks-edit-point-lon-input" class="line-input-width-fit" type="text" value="0.0"/>
                        </div>
                        <div class="coords-input-item">
                            <label for="tracks-edit-point-alt-input" class="label-column">Altitude</label>
                            <input id="tracks-edit-point-alt-input" class="line-input-width-fit" type="text" value="0.0"/>
                        </div>
                    </div>
                </div>
                <div class="tracks-edit-input-item">
                    <label for="tracks-edit-point-audio-input" class="label-column">Audio track</label>
                    <input id="tracks-edit-point-audio-input" class="line-input-width-fit" type="file" />            
                </div>
            </div>
            <div class="toolbar">
                <div id="tracks-edit-point-save" class="one-button-toolbar-button-container">
                    <img class="toolbar-button-icon" src="images/icons/save.png" alt="Save track">
                </div>           
            </div>
        </div>';

?>