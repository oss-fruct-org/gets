<?php

echo    '<div id="social-info-page" class="action-menu-container hidden" data-pagetitle="'. '" data-messagesuccess-remove="' . getString('social-remove-success','Social was successfully removed') . '" data-putsocial="' . getString('put-social-in-social-info','Put social into the «Social Info» window') . '">
            <div class="action-menu-inner-content-social-info">
                <div class="main-block-bold" id="social-info-name" align="center" ></div>
                <div class="main-block-italic" id="social-info-objectName" align="center"></div>
                <div class="main-block" id="social-info-address"></div>
                <div class="main-block" id="social-info-route"></div>
                <div class="main-block" id="social-info-access"></div>
            <br>
                <div align="center">
                    <div class="btn-group">
                        <a id="social-all-access" class="btn btn-default" title="Показать все категории" role="button" >
                            Показать все категории
                        </a>
                    </div>
                </div>
            <br>
                <div align="center">
                    <div class="btn-group">
                        <a id="social-map-focus" class="btn btn-default" title="Показать на карте" role="button" >
                            Показать на карте
                        </a>
                    </div>
                </div>
            </div>
        </div>';
?>