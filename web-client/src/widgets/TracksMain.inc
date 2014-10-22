<?php

echo   '<div id="tracks-main-page" class="action-menu-container hidden">
            <div id="tracks-main-overlay" class="busy-overlay"></div>
            <div class="action-menu-toolbar-container">
                <div class="btn-group btn-group-justified">
                    <div class="btn-group">
                        <a id="tracks-main-add-track" class="btn btn-default" href="#form=track_add" title="' . getString('add-track', 'Add track') . '" role="button">
                            <span class="glyphicon glyphicon-plus"></span> ' . getString('add-track', 'Add track') . '
                        </a>
                    </div>
                    <div class="btn-group">
                        <a id="tracks-main-update" class="btn btn-default" href="#" title="' . getString('update', 'Update') . '" role="button">
                            <span class="glyphicon glyphicon-refresh"></span> ' . getString('update', 'Update') . ' 
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
                                    ' . getString('filter-tracks', 'Filter tracks') . '
                                </a>
                            </h4>
                        </div>
                        <div id="search-block-collapse" class="panel-collapse collapse">
                            <div class="panel-body">
                                <div class="main-block search-input-container">
                                    <label for="tracks-main-search-input">' . getString('filter-by-name', 'Filter by name: ') . '</label>
                                    <input id="tracks-main-search-input" class="form-control search-query" name="track-name" type="text" placeholder="' . getString('track-name', 'Track name') . '"/>            
                                </div>
                                <div class="main-block">
                                    <label for="tracks-main-filter-category">' . getString('filter-by-category', 'Filter by category: ') . '</label>
                                    <select id="tracks-main-filter-category" class="form-control" name="category" size="1"></select>            
                                </div>' . 
                                (
                                    isset($_SESSION['g2t_token']) ? 
                                    '<div class="main-block">
                                        <label for="tracks-main-filter-space">' . getString('filter-by-space', 'Filter by space: ') . '</label>
                                        <select id="tracks-main-filter-space" class="form-control" name="space" size="1">
                                            <option value="all">' . getString('filter-all', 'All') . '</option>
                                            <option value="private">' . getString('filter-only-my', 'Only My') . '</option>
                                            <option value="public">' . getString('filter-only-public', 'Only Public') . '</option>
                                        </select>            
                                    </div>' :
                                    ''
                                )
                             . '<div class="main-block">
                                    <a id="tracks-main-search" class="btn btn-primary center-block" href="#" title="' . getString('filter', 'Filter') . '" role="button">' . getString('filter', 'Filter') . '</a>
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