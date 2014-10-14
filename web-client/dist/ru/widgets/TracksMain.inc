<?php

echo   '<div id="tracks-main-page" class="action-menu-container hidden">
            <div id="tracks-main-overlay" class="busy-overlay"></div>
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="tracks-main-add-track" class="btn btn-default" href="#form=track_add" title="Добавить маршрут" role="button">
                            <span class="glyphicon glyphicon-plus"></span> Добавить маршрут
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="tracks-main-update" class="btn btn-default" href="#" title="Обновить" role="button">
                            <span class="glyphicon glyphicon-refresh"></span> Обновить 
                        </a>
                    </div>
                </div>
            </div>
            <div class="bordered-element">
                <div id="tracks-main-search-accordion" class="panel-group">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a class="accordion-toggle" data-toggle="collapse" data-parent="#tracks-main-search-accordion" href="#search-block-collapse">
                                    Фильтр маршрутов
                                </a>
                            </h4>
                        </div>
                        <div id="search-block-collapse" class="panel-collapse collapse">
                            <div class="panel-body">
                                <div class="main-block search-input-container">
                                    <label for="tracks-main-search-input">Фильтр по имени: </label>
                                    <input id="tracks-main-search-input" class="form-control search-query" name="track-name" type="text" placeholder="Имя маршрута"/>            
                                </div>
                                <div class="main-block">
                                    <label for="tracks-main-filter-category">Фильтр по категории: </label>
                                    <select id="tracks-main-filter-category" class="form-control" name="category" size="1"></select>            
                                </div>' . 
                                (
                                    isset($_SESSION['g2t_token']) ? 
                                    '<div class="main-block">
                                        <label for="tracks-main-filter-space">Фильтр по пространству: </label>
                                        <select id="tracks-main-filter-space" class="form-control" name="space" size="1">
                                            <option value="all">Все</option>
                                            <option value="private">Только мои</option>
                                            <option value="public">Только публичные</option>
                                        </select>            
                                    </div>' :
                                    ''
                                )
                             . '<div class="main-block">
                                    <a id="tracks-main-search" class="btn btn-primary center-block" href="#" title="Фильтр" role="button">Фильтр</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>          
            </div>
            <div class="action-menu-inner-content"> 
                <div id="tracks-list" class="list-group">
                </div>            
            </div>
        </div>';
?>