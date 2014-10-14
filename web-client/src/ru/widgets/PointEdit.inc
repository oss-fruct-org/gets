<?php

echo    '<div id="edit-point-page" class="action-menu-container hidden" data-pagetitle-add="Добавить точку" data-pagetitle-edit="Редактировать точку" data-messagesuccess-add="Точка успешно добавлена" data-messagesuccess-edit="Точка успешно отредактирована">
            <div id="edit-point-overlay" class="busy-overlay"></div>
            <form id="edit-point-form" action="javascript:void(null);" role="form">
                <div class="action-menu-toolbar-container">
                    <div class="btn-group btn-group-justified">
                        <div class="btn-group">
                            <button id="edit-point-save" type="submit" class="btn btn-success">
                                <span class="glyphicon glyphicon-ok"></span> Ok 
                            </button>
                        </div>
                    </div>
                </div>
                <div class="action-menu-inner-content">
                    <div class="form-group">
                        <label for="edit-point-name-input">Имя *</label>
                        <input id="edit-point-name-input" class="form-control" name="title" type="text" required/>            
                    </div>
                    <div class="form-group">
                        <label for="edit-point-desc-input">Описание</label>
                        <textarea id="edit-point-desc-input" class="form-control" name="description"></textarea>            
                    </div>
                    <div class="form-group">
                        <label for="edit-point-url-input">Ссылка</label>
                        <input id="edit-point-url-input" class="form-control" name="url" type="url" />            
                    </div>                                      
                    <div class="form-group">
                        <label class="control-label">Координаты * </label> 
                        <button id="edit-point-use-map" type="button" class="btn btn-default" title="Использовать карту">
                            <span class="glyphicon glyphicon-globe"></span> Использовать карту
                        </button>
                        <div class="col-md-12">
                            <div class="form-group row">
                                <div class="col-md-6">
                                    <label for="edit-point-lat-input" class="control-label">Широта</label>                                               
                                    <input id="edit-point-lat-input" name="latitude" type="text" class="form-control" value="0.0" required">
                                </div>
                                <div class="col-md-6">
                                    <label for="edit-point-lon-input" class="control-label">Долгота</label>                                               
                                    <input id="edit-point-lon-input" name="longitude" type="text" class="form-control" value="0.0" required">
                                </div>
                                <input id="edit-point-alt-input" name="altitude" type="hidden" value="0.0" required>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-active-radius-input" class="block">Активный радиус (метры) *</label>
                        <input id="edit-point-active-radius-input" name="radius" type="text" class="form-control" value="63" required">
                    </div>
                    <div class="form-group">
                        <label for="edit-point-picture-input">Изображение<br>Встаить ссылку (URL) или <a id="edit-point-picture-toggle-upload" href="#">загрузить файл</a></label>
                        <button type="button" class="btn btn-default btn-xs" data-toggle="popover" title="Data upload" data-content="ddddd" data-container="#edit-point-page" data-placement="right" data-trigger="focus">
                            <span class="glyphicon glyphicon-question-sign"></span>
                        </button>
                        <input id="edit-point-picture-input-url" name="picture-url" type="url" class="form-control">
                        <br>
                        <div id="edit-point-picture-upload" class="hidden">
                            <input id="edit-point-picture-input-file" class="form-control" type="file" accept="image/*" /> 
                            <div class="btn-group btn-group-justified">
                                <div class="btn-group">
                                    <button id="edit-point-picture-input-file-upload" class="btn btn-default disabled" type="button">
                                        <span class="glyphicon glyphicon-upload"></span> Загрузить 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-picture-input-file-clear" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-trash"></span> Очистить 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-picture-input-file-cancel" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-remove"></span> Закрыть 
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-point-audio-input">Аудио дорожка<br>Встаить ссылку (URL) или <a id="edit-point-audio-toggle-upload" href="#">загрузить файл</a></label>
                        <input id="edit-point-audio-input-url" name="audio-url" type="url" class="form-control">
                        <br>
                        <div id="edit-point-audio-upload" class="hidden">
                            <input id="edit-point-audio-input-file" class="form-control" type="file" accept="audio/*" /> 
                            <div class="btn-group btn-group-justified">
                                <div class="btn-group">
                                    <button id="edit-point-audio-input-file-upload" class="btn btn-default disabled" type="button">
                                        <span class="glyphicon glyphicon-upload"></span> Загрузить 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-audio-input-file-clear" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-trash"></span> Очистить 
                                    </button>
                                </div>
                                <div class="btn-group">
                                    <button id="edit-point-audio-input-file-cancel" class="btn btn-default" type="button">
                                        <span class="glyphicon glyphicon-remove"></span> Закрыть 
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p>* - Обязательные поля</p>
                </div>              
            </form>           
        </div>';
?>