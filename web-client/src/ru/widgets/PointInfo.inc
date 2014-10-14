<?php

echo    '<div id="point-info-page" class="action-menu-container hidden" data-pagetitle="Инф-ия о точке" data-messagesuccess-remove="Точка была успешно удалена">
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="point-info-edit" class="btn btn-default" title="Редактировать точку" role="button">
                            <span class="glyphicon glyphicon-pencil"></span> Редактировать точку 
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="point-info-remove" class="btn btn-danger" href="#" title="Удалить точку" role="button" data-removetext="Вы действительно хотите удалить эту точку? (Это действие невозможно отменить.)">
                            <span class="glyphicon glyphicon-remove"></span> Удалить точку 
                        </a>
                    </div>
                </div>
            </div>
            <div class="action-menu-inner-content">
                <div id="point-info-name" class="main-block font-big width-three-fourth height-100"></div>               
                <!--<div id="point-info-map" class="button-w-icon" title="Show on map">
                    <img src="images/icons/map.png" alt="Show on map">
                </div>-->
                <div id="point-info-coords" class="main-block"></div>
                <div id="point-info-image" class="main-block">
                    <img class="info-image" alt="Нет изображения">
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