<?php

echo    '<div id="tracks-info-page" class="action-menu-container hidden" data-pagetitle="' . getString('track-info-title','Track Info') . '" data-messagesuccess-remove="' . getString('track-remove-success','Track was successfully removed') . '" data-messagesuccess-publish="' . getString('track-publish-success', 'Track was successfully published') . '" data-messagesuccess-unpublish="' . getString('track-unpublish-success', 'Track was successfully unpublished') . '">
            <div id="tracks-info-overlay" class="busy-overlay"></div>
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="tracks-info-add" class="btn btn-default" title="' . getString('add-point','Add point') . '" role="button">
                            <span class="glyphicon glyphicon-plus"></span> ' . getString('add-point','Add point') . '
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="tracks-info-edit" class="btn btn-default" title="' . getString('edit-track','Edit track') . '" role="button">
                            <span class="glyphicon glyphicon-pencil"></span> ' . getString('edit-track','Edit track') . ' 
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="tracks-info-remove" class="btn btn-danger" href="#" title="' . getString('remove-track','Remove track') . '" role="button" data-removetext="' . getString('track-remove-text','Are you sure you want to remove this track? (This action cannot be cancelled.)') . '">
                            <span class="glyphicon glyphicon-remove"></span> ' . getString('remove-track','Remove track') . ' 
                        </a>
                    </div>
                </div>
            </div>
            <div class="action-menu-inner-content">
                <div id="tracks-info-name" class="main-block font-big height-half">                   
                </div>
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <!--<button id="tracks-info-map" type="button" class="btn btn-default" title="' . getString('show-on-map','Show on map') . '">
                            <span class="glyphicon glyphicon-globe"></span> ' . getString('show-on-map','Show on map') . '
                        </button>-->
                        <div class="dropdown">
                            <button class="btn btn-default dropdown-toggle" id="tracks-info-map" type="button" data-toggle="dropdown" aria-expanded="true" title="' . getString('show-on-map','Show on map') . '">
                              <span class="glyphicon glyphicon-globe"></span> ' . getString('show-on-map','Show on map') . '
                              <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" role="menu" aria-labelledby="tracks-info-map">
                              <li role="presentation"><a id="tracks-info-map-raw-simple" role="menuitem" tabindex="-1" href="#">' . getString('show-on-map-raw-simple','Raw route') . '</a></li>
                              <li role="presentation"><a id="tracks-info-map-service" role="menuitem" tabindex="-1" href="#">' . getString('show-on-map-service','Use Google Route Service') . '</a></li>
                              <li role="presentation"><a id="tracks-info-map-raw-curve" role="menuitem" tabindex="-1" href="#">' . getString('show-on-map-raw-curve','Smooth curve based on Raw route (experimental)') . '</a></li>
                              <li role="presentation"><a id="tracks-info-map-service-curve" role="menuitem" tabindex="-1" href="#">' . getString('show-on-map-service-curve','Smooth curve based on Google RS (experimental)') . '</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="btn-group ' . (isset($_SESSION['trusted_user']) || isset($_SESSION['admin_user']) ? '' : 'hidden') . '">
                        <button id="tracks-info-publish" class="btn btn-default" type="button" data-label-publish="' . getString('publish-track','Publish track') . '" data-label-unpublish="' . getString('unpublish-track', 'Unpublish track') . '">
                            <span class="glyphicon glyphicon-share-alt"></span>  
                        </button>
                    </div>
                </div>
                
                    <div id="tracks-info-route-parameters-container" class="well well-sm display-none">
                        <button id="tracks-info-route-parameters-container-close" type="button" class="close"><span aria-hidden="true">&times;</span></button>
                        <div class="row"></div>
                        <form id="tracks-info-route-parameters-form" action="javascript:void(null);" role="form">
                            <div class="row">
                                <div class="col-md-1"></div>
                                <div class="col-md-4">
                                    <label for="tracks-info-route-parameters-mode" class="control-label">' . getString('route-parameters-mode','Travel Mode: ') . '</label>
                                    <div id="tracks-info-route-parameters-mode">
                                        <label>
                                            <input name="mode" value="walking" type="radio" checked="checked"> ' . getString('walking-mode','Walking') . '
                                        </label>
                                        <label>
                                            <input name="mode" value="driving" type="radio"> ' . getString('driving-mode','Driving') . '
                                        </label>
                                        <label>
                                            <input name="mode" value="bicycling" type="radio"> ' . getString('bicycling-mode','Bicycling') . '
                                        </label>
                                    </div>           
                                </div>
                                <div class="col-md-1"></div>
                                <div class="col-md-6">
                                    <label for="tracks-info-route-parameters-optimization" class="control-label">' . getString('route-parameters-optimization','Optimization: ') . '</label>
                                    <div id="tracks-info-route-parameters-optimization">
                                        <label>
                                            <input name="optimize" value="true" type="checkbox"> ' . getString('optimize-route','Optimize route') . '
                                        </label>
                                    </div>           
                                    <label for="tracks-info-route-parameters-alternatives" class="control-label">' . getString('route-parameters-alternatives','Alternatives: ') . '</label>
                                    <div id="tracks-info-route-parameters-alternatives">
                                        <label>
                                            <input name="alternatives" value="true" type="checkbox"> ' . getString('find-alternatives','Find alternatives') . '
                                        </label>
                                    </div>           
                                </div>
                            </div>
                            <br>
                            <div class="row">
                                <div class="col-md-12 text-center"> 
                                    <button id="tracks-info-route-submit" type="submit" class="btn btn-success">
                                        ' . getString('request-route','Request route') . ' 
                                    </button>
                                </div>
                            </div>    
                        </form>
                    </div>
                
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
                                        ' . getString('point-list','Point List') . ' <span id="tracks-points-list-count-badge" class="badge"></span>
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