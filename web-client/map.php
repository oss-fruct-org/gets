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
        <link rel="stylesheet" href="js/jquery-ui/css/smoothness/jquery-ui-1.10.4.custom.min.css">
        <link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>
        <script src="js/jquery-ui/js/jquery-1.10.2.js"></script>
        <script src="js/jquery-ui/js/jquery-ui-1.10.4.custom.min.js"></script>      
        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
        <script src="js/scripts.js"></script>
        <script>
            $(function() {
                $( "#tabs" ).tabs();
            });
        </script>
         <?php
        include('html_headers.php');
        ?>
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
                <table class="content-table" width="1000px" border="0" cellpadding="0" cellspacing="0">
                    <tr style="width: 400px;">
                        <td style="width: 400px;" valign="top">
                        </td>
                        <td style="width: 600px;" valign="top">
                            <div id="map" style="width: 600px; height: 730px"></div>                   
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