<?php
session_start();
if (!isset($_SESSION['g2t_token']) && !isset($_SESSION['guestsession'])) {
    header("Location:login.php");
}
if (isset($_SESSION['guestsession'])) {
    if ($_SESSION['guestsession'] !== 1) {
        header("Location:login.php");
    }
}
include_once('actions/utils.inc');
?>
<html>
    <head>
        <?php
        include('html_headers.php');
        ?>
        <link rel="stylesheet" href="js/jquery-ui/css/smoothness/jquery-ui-1.10.4.custom.min.css">
        <link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>
        <script src="js/jquery-ui/js/jquery-1.10.2.js"></script>
        <script src="js/jquery-ui/js/jquery-ui-1.10.4.custom.min.js"></script>
        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
        <script src="js/scripts.js"></script>
        <script>
            $(function() {
                $( "#accordion" ).accordion({
                    collapsible: true
                });
            });
            
            $(function() {
                $( "#tabs" ).tabs();
            });
        </script>
        <title>GeTS Web Client</title>
    </head>
    <body>
        <div class="main-container">
            <div class="main-header">
                <?php
                include('widgets/header.php');
                include('widgets/menu.php');
                echo getMenuAsString(basename(__FILE__, '.php'));
                ?>
            </div>
            <div class="main-content">
                <table class="content-table" width="1100px" border="0" cellpadding="0" cellspacing="0">
                    <tr style="width:400px;">
                        <td style="width: 400px;" valign="top">
                            <div id="accordion">
                                <h3>Load track list</h3>                           
                                <div class="load-tracks-input">
                                    <p>
                                        <input id="load-track-submit" type="button" value="Load Tracks" onclick="loadTracksHandler();">
                                    </p>
                                </div>
                                <h3>Load track</h3>                           
                                <div class="load-track-input">
                                    <p>
                                        <input id="track-name-input" type="text" placeholder="Name">
                                    </p>
                                    <p>
                                        <input id="load-track-submit" type="button" value="Load Track" onclick="loadTrackHandler();">
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td style="width: 700px;" valign="top">
                            <div id="tabs">
                                <ul>
                                    <li><a href="#tab-map">Map</a></li>
                                    <li><a href="#tab-list">List</a></li>
                                </ul>
                                <div id="tab-map">
                                    <div id="map" style="width: 700px; height: 730px"></div>
                                </div>
                                <div id="tab-list">
                                    <table class="tab-list-table" width="700px" border="2"></table>
                                </div>
                            </div>     
                        </td>
                    </tr>
                </table>
            </div>
            <div class="main-footer">
                <?php
                include('widgets/footer.php');
                ?>
            </div>
        </div>
        <script src="js/map.js"></script>
    </body>
</html>