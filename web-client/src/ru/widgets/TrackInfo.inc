<?php

echo    '<div id="tracks-info-page" class="action-menu-container hidden" data-pagetitle="Инф-ия о марш." data-messagesuccess-remove="Маршрут был успешно удален">
            <div id="tracks-info-overlay" class="busy-overlay"></div>
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="tracks-info-add" class="btn btn-default" title="Доб-ть точку" role="button">
                            <span class="glyphicon glyphicon-plus"></span> Доб-ть точку
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="tracks-info-edit" class="btn btn-default" title="Ред-ть марш-т" role="button">
                            <span class="glyphicon glyphicon-pencil"></span> Ред-ть марш-т
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="tracks-info-remove" class="btn btn-danger" href="#" title="Уд-ть марш-т" role="button" data-removetext="Вы действительно хотите удалить этот трек? (Это действие невозможно отменить.)">
                            <span class="glyphicon glyphicon-remove"></span> Уд-ть марш-т
                        </a>
                    </div>
                </div>
            </div>
            <div class="action-menu-inner-content">
                <div id="tracks-info-name" class="main-block font-big width-three-fourth ellipsis-text">                   
                </div>
                <button id="tracks-info-map" type="button" class="btn btn-default" title="Показать на карте">
                    <span class="glyphicon glyphicon-globe"></span> Показать на карте
                </button>
                <div id="tracks-info-category" class="main-block"></div>
                <div id="tracks-info-lang" class="main-block"></div>
                <div id="tracks-info-url" class="main-block"></div>
                <div id="tracks-info-description" class="main-block"></div>
                <div class="main-block">
                    <div id="tracks-info-points-accordion" class="panel-group">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h5 class="panel-title">
                                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#tracks-info-points-accordion" href="#tracks-points-block-collapse">
                                        Список точек <span id="tracks-points-list-count-badge" class="badge"></span>
                                    </a>
                                </h5>
                            </div>
                            <div id="tracks-points-block-collapse" class="panel-collapse collapse">
                                <div class="panel-body">
                                    <div id="tracks-points-list" class="list-group"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>           
            </div>
        </div>';    
?>