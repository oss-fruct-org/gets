<?php

echo   '<div id="points-main-page" class="action-menu-container hidden">
            <div id="points-main-overlay" class="busy-overlay"></div>
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="points-main-add-point" class="btn btn-default" href="#form=add_point" title="Добавить точку" role="button">
                            <span class="glyphicon glyphicon-plus"></span> Добавить точку
                        </a>
                    </div>                   
                </div>
            </div>
            <div class="bordered-element">
                <div id="points-main-search-accordion" class="panel-group">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a class="accordion-toggle" data-toggle="collapse" data-parent="#points-main-search-accordion" href="#search-block-collapse">
                                   Поиск точек
                                </a>
                            </h4>
                        </div>
                        <div id="search-block-collapse" class="panel-collapse collapse">
                            <div class="panel-body">
                                <form id="point-main-form" action="javascript:void(null);" role="form">
                                    <div class="form-group">
                                        <label class="control-label">Координаты </label> 
                                        <div class="col-md-12">
                                            <div class="form-group row">
                                                <div class="col-md-6">
                                                    <label for="points-main-latitude-input" class="control-label">Широта</label>                                               
                                                    <input id="points-main-latitude-input" name="latitude" type="text" class="form-control" value="0.0"/>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="points-main-longitude-input" class="control-label">Долгота</label>                                               
                                                    <input id="points-main-longitude-input" name="longitude" type="text" class="form-control" value="0.0"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>                                  
                                    <!--<div class="form-group">
                                        <label for="points-main-radius-input">Радиус </label>
                                        <input id="points-main-radius-input" name="radius" type="text" class="form-control" value="10"/>          
                                    </div>-->
                                    <input id="points-main-radius-input" name="radius" type="hidden" class="form-control" value="10"/>
                                    <div class="checkbox">
                                        <label for="points-main-show-search-area" class="control-label">
                                            <input id="points-main-show-search-area" type="checkbox"> Показать область поиска
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label for="points-main-filter-category">Категория </label>
                                        <select id="points-main-filter-category" class="form-control" name="category_id" size="1"></select>            
                                    </div>' . 
                                    (
                                        isset($_SESSION['g2t_token']) ? 
                                        '<div class="form-group">
                                            <label for="points-main-filter-space">Пространство </label>
                                            <select id="points-main-filter-space" class="form-control" name="space" size="1">
                                                <option value="all">Все</option>
                                                <option value="private">Приватные</option>
                                                <option value="public">Публичные</option>
                                            </select>            
                                        </div>' :
                                        ''
                                    )
                                 . '<div class="main-block">
                                        <button id="points-main-search" class="btn btn-primary center-block" href="#" type="submit" title="Поиск">Поиск</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>          
            </div>
            <div class="action-menu-inner-content"> 
                <ul id="point-list" class="list-group">
                </ul>            
            </div>
        </div>';

?>

