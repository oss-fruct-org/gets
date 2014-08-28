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
        <?php
        echo '<script>var IS_LOGGED_IN = false;';
        if (isset($_SESSION['g2t_token'])) {
            echo 'IS_LOGGED_IN = true;';
        } 
        echo '</script>';
        ?>
        <script src="js/scripts.js"></script>
        <script>
            $( document ).ready(function() {
                
                fitMap();
                
                downloadCategories();
                               
                updateTracks();
                
                changeForm();
                
                getGeoPosition();
                
                if (!IS_LOGGED_IN) {
                    var tracksMainAdd = $( '#tracks-main-add' );
                    $( tracksMainAdd ).on('click', function(e) { 
                        e.preventDefault();
                    });
                    $( tracksMainAdd ).addClass('disabled-element');
                }
                               
                $( '#tracks-main-search-input' ).on('input', function() { 
                    var inputValue = $( this ).val();
                    updateHashParameter('name', inputValue);
                    searchTracks();
                });
                
                $( '#tracks-main-filter-category' ).on('change', function () {
                    var categoryId = $( this ).find('option:selected').attr('value');
                    updateHashParameter('category_id', categoryId);
                    searchTracks();
                });
                
                $(window).on('hashchange', function() {
                    console.log('hashchanged');
                    changeForm();
                });
                               
                $( window ).resize(function() {
                    fitMap();
                });
                
                $( '#tracks-info-map' ).on('click', function() { 
                    checkTrackOnMap();
                });
                
                $( '#tracks-main-update' ).on('click', function() {               
                    window.location.hash = 'form=main';
                    $( '#tracks-main-search-input' ).val('');
                    updateTracks();
                });
                
                function fitMap() {
                    $('#map').width($(window).width() - 403).height($(window).height() - 50);
                }
                             
                $( '#tracks-edit-point-use-map' ).on('click', function() {
                    if ($( this ).hasClass('pushed-button')) {
                        $( this ).removeClass('pushed-button');
                        removeTempMarker();
                    } else {
                        $( this ).addClass('pushed-button');
                        createTempMarker();
                    }
                });
                
                $( '#tracks-edit-track-form' ).on('submit', function () {
                    $( '#tracks-edit-track-overlay' ).toggleClass('busy-overlay-visible');
                    
                    addTrack($(this).serializeArray()); 
                    
                    $( '#tracks-edit-track-overlay' ).toggleClass('busy-overlay-visible');
                });
                              
                $( '#tracks-edit-point-form' ).on('submit', function (e) {
                    
                    e.preventDefault();
                                      
                    if (checkCoordsInput(
                            $( this ).find( '#tracks-edit-point-lat-input' ).val(), 
                            $( this ).find( '#tracks-edit-point-lon-input' ).val(), 
                            $( this ).find( '#tracks-edit-point-alt-input' ).val()
                    )) {
                        $( '#tracks-edit-point-overlay' ).toggleClass('busy-overlay-visible');
                
                        var imageFile = $('#tracks-edit-point-picture-input').get(0).files[0];
                        var imageFileDownloadURL = null;
                        if (typeof imageFile !== 'undefined') {
                            imageFileDownloadURL = uploadFile({ 
                                file: imageFile
                            });
                            console.log('imageFile mime-type: ' + imageFile.type);
                        }
                        
                        var audioFile = $('#tracks-edit-point-audio-input').get(0).files[0];
                        var audioFileDownloadURL = null;
                        if (typeof audioFile !== 'undefined') {
                            audioFileDownloadURL = uploadFile({ 
                                file: audioFile
                            });
                            console.log('audioFile mime-type: ' + audioFile.type);
                        }
                        
                        var paramsObj = $(this).serializeArray();
                        paramsObj.push({name: 'imageURL', value: imageFileDownloadURL});
                        paramsObj.push({name: 'audioURL', value: audioFileDownloadURL});
                        
                        addPoint(paramsObj);
                        
                        $( '#tracks-edit-point-overlay' ).toggleClass('busy-overlay-visible');
                    }
                });
                
                $( '#tracks-info-remove' ).on('click', function() {
                    console.log('Remove track clicked');
                    if (IS_LOGGED_IN && track.access !== 'r') {
                        if (confirm('Are you sure you want to remove this track? (This action cannot be cancelled.)')) {
                            removeTrackFromMap();
                            removeTrack();
                        }
                    }
                });
                
                $( '#tracks-point-info-remove' ).on('click', function() {
                    console.log('Remove point clicked');
                    if (IS_LOGGED_IN && track.access !== 'r') {
                        if (confirm('Are you sure you want to remove this point? (This action cannot be cancelled.)')) {
                            removePoint();
                        }
                    }
                });
                
                $( '#tracks-edit-point-audio-input-clear' ).on('click', function () {
                    resetFileInput($( '#tracks-edit-point-audio-input' ));
                });
                
                $( '#tracks-edit-point-picture-input-clear' ).on('click', function () {
                    resetFileInput($( '#tracks-edit-point-picture-input' ));
                });
                
                //$( '#tracks-info-remove' ).
                                                          
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
                <div class="action-menu">
                    <?php
                    include('widgets/tracks/main.inc');
                    include('widgets/tracks/trackInfo.inc');
                    include('widgets/tracks/pointInfo.inc');
                    if (isset($_SESSION['g2t_token'])) {
                        include('widgets/tracks/trackEdit.inc');
                        include('widgets/tracks/pointEdit.inc');
                    }
                    ?>
                </div><!--
             --><div id="map"></div>   
            </div>
            <?php
                include('widgets/main/message_box.inc');
            ?>
        </div>
        <script src="js/map.js"></script>
    </body>
</html>