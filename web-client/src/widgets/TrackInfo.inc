<?php

echo    '<div id="tracks-info-page" class="action-menu-container hidden" data-pagetitle="' . getString('track-info-title','Track Info') . '" data-messagesuccess-remove="' . getString('track-remove-success','Track was successfully removed') . '">
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
                <div id="tracks-info-name" class="main-block font-big width-three-fourth ellipsis-text">                   
                </div>
                <button id="tracks-info-map" type="button" class="btn btn-default" title="' . getString('show-on-map','Show on map') . '">
                    <span class="glyphicon glyphicon-globe"></span> ' . getString('show-on-map','Show on map') . '
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