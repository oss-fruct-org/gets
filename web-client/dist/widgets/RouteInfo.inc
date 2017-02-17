<?php

echo    '<div id="route-info-page" class="action-menu-container hidden" data-pagetitle="'. getString('track-info-title', 'Track info') .'" data-putpoint="'.getString('put-track-in-track-info', '').'">
            <div class="action-menu-inner-content">                               
                <div class="main-block">
                    <div class="distance-route-div" style="">
                        <div class="distanceBtn" style="background: #2ecc71" id="route-type-safe"></div>
                        <div class="distanceBtn" style="background: #f1c40f" id="route-type-normal"></div>
                        <div class="distanceBtn" style="background: #c0392b" id="route-type-fastest"></div>     
                    </div>
                  
                    <span><b>'.getString('cost', 'Cost').':</b></span><div id="route-weight"></div>
                    <div id="obstacles_calc"></div>
                    <span><b>'.getString('obstacles', 'Obstacles').':</b></span>
                    <div id="route-obstacles"></div>
                </div>   
            </div>
        </div>';

?>