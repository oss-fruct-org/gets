<?php
session_start();

include_once('actions/utils/utils.inc');
?>
<html>
    <head>
        <?php
        include('html_headers.php');
        ?>
        <link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>
        <script src="js/jquery-ui/js/jquery-1.10.2.js"></script>
        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
        <script src="js/scripts.js"></script>
        <script>
            $( document ).ready(function() {
                
                fitMap();
                
                downloadCategories();
                               
                updateTracks();
                
                changeForm();
                
                //window.location.hash = 'form=main';
                
                $( '#tracks-main-search-input' ).on('input', function() { 
                    var inputValue = $( this ).val();
                    searchTrack(inputValue);
                    window.location.hash = 'form=main&name=' + inputValue;
                });
                
                $(window).on('hashchange', function() {
                    console.log('hashchange');
                    changeForm();
                });
                               
                $( window ).resize(function() {
                    fitMap();
                });
                
                $( '#tracks-info-map' ).on('click', function() { 
                    placeTrackOnMap();
                });
                
                $( '#tracks-main-update' ).on('click', function() {
                    window.location.hash = 'form=main';
                    $( '#tracks-main-search-input' ).val('');
                    updateTracks();
                });
                
                function fitMap() {
                    $('#map').width($(window).width() - 400).height($(window).height() - 100);
                }
                
                $( '#tracks-info-back-button, #tracks-point-info-back-button, #tracks-edit-track-back-button' ).on('click', function() {
                    window.history.back();
                });
                
                $( '#tracks-edit-track-save, #tracks-info-add, #tracks-info-edit, #tracks-info-remove, #tracks-point-info-edit, #tracks-point-info-remove' ).on('click', function() {
                    showMessage('Not yet implemented', INFO_MESSAGE);
                });
                                             
                console.log($.getUrlVar('form'));

            });    
        </script>
        <title>GeTS Web Client</title>
    </head>
    <body>
        <div class="main-container">
            <div class="main-header">
                <?php
                include('widgets/main/header.inc');
                include('widgets/main/menu.inc');
                echo getMenuAsString(basename(__FILE__, '.php'));
                ?>
            </div>
            <div class="main-content">
                <table class="content-table" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="action-menu" valign="top">
                            <?php
                            include('widgets/tracks/main.inc');
                            include('widgets/tracks/trackInfo.inc');
                            include('widgets/tracks/pointInfo.inc');
                            if (isset($_SESSION['g2t_token'])) {
                                include('widgets/tracks/trackEdit.inc');
                                include('widgets/tracks/pointEdit.inc');
                            }
                            ?>
                        </td>
                        <td valign="top">
                            <div id="map" style="position: absolute;"></div>   
                        </td>
                    </tr>
                </table>
                <?php
                include('widgets/main/message_box.inc');
                ?>
            </div>
            <div class="main-footer">
                <?php
                include('widgets/main/footer.inc');
                ?>
            </div>
        </div>
        <script src="js/map.js"></script>
    </body>
</html>