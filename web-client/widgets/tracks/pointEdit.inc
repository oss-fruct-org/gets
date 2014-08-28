<?php

echo    '<div id="tracks-edit-point-page" class="tracks-container hidden">   
            <div id="tracks-edit-point-overlay" class="busy-overlay busy-overlay-hidden"></div>
            <form id="tracks-edit-point-form" action="javascript:void(null);">
                <div class="toolbar">
                    <input id="tracks-edit-point-save" class="one-button-toolbar-button-container input-submit" type="submit" value="" />            
                </div>
                <div class="tracks-container-inner-content">
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-name-input" class="label-column">Name *</label>
                        <input id="tracks-edit-point-name-input" class="line-input-width-fit" name="title" type="text" required/>            
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-desc-input" class="label-column">Description</label>
                        <textarea id="tracks-edit-point-desc-input" class="textarea-width-fit" name="description"></textarea>            
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-url-input" class="label-column">Url</label>
                        <input id="tracks-edit-point-url-input" class="line-input-width-fit" name="url" type="url" />            
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-category-input" class="label-column">Category</label>
                        <select id="tracks-edit-point-category-input" name="category_id" size="1">
                        </select>
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-coords-input">
                            Coordinates *
                        </label>
                        <div id="tracks-edit-point-use-map" class="button-w-icon" title="Use map">
                            <img src="images/icons/map.png" alt="Use map">
                        </div>
                        <div class="coords-input-container">
                            <div class="coords-input-item">
                                <label for="tracks-edit-point-lat-input" class="label-column">Latitude</label>
                                <input id="tracks-edit-point-lat-input" class="line-input-width-fit" name="latitude" type="text" value="0.0" required/>
                            </div>
                            <div class="coords-input-item">
                                <label for="tracks-edit-point-lon-input" class="label-column">Longitude</label>
                                <input id="tracks-edit-point-lon-input" class="line-input-width-fit" name="longitude" type="text" value="0.0" required/>
                            </div>
                            <div class="coords-input-item">
                                <label for="tracks-edit-point-alt-input" class="label-column">Altitude</label>
                                <input id="tracks-edit-point-alt-input" class="line-input-width-fit" name="altitude" type="text" value="0.0" required/>
                            </div>
                        </div>
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-picture-input" class="label-column">Picture</label>
                        <input id="tracks-edit-point-picture-input" class="inline-block max-width-three-fourths" name="picture" type="file" accept="image/*" />
                        <input id="tracks-edit-point-picture-input-clear" class="inline-block" type="button" value="Clear"/>
                    </div>
                    <div class="tracks-edit-input-item">
                        <label for="tracks-edit-point-audio-input" class="label-column">Audio track</label>
                        <input id="tracks-edit-point-audio-input" class="inline-block max-width-three-fourths" name="audio" type="file" accept="audio/*" /> 
                        <input id="tracks-edit-point-audio-input-clear" class="inline-block" type="button" value="Clear"/>
                    </div>
                    <p>* - Required fields</p>
                </div>              
            </form>           
        </div>';

?>