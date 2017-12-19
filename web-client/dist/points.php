<?php
session_start();
require_once('./config.php');
require_once(TRANSLATIONS_SCRIPT);

?>
<!DOCTYPE html>
<html>
    <head>               
        <link rel="stylesheet" href="styles/bootstrap/bootstrap.min.css">
        <link rel="stylesheet" href="styles/bootstrap/bootstrap-theme.min.css">
	<!--[if lt IE 9]>
	    <link rel="stylesheet" href="styles/leaflet/0.7/leaflet.css" />
	    <link rel="stylesheet" type="text/css" href="styles/leaflet/0.7/MarkerCluster.css"/>
	<![endif]-->
	<!--[if (gt IE 8)]><!-->
	    <link rel="stylesheet" href="styles/leaflet/leaflet.css" />
	    <link rel="stylesheet" type="text/css" href="styles/leaflet/MarkerCluster.css"/>
	<!--<![endif]-->        
        <link rel="stylesheet" href="styles/languages.min.css">
        <link rel="stylesheet" type="text/css" href="styles/leaflet/leaflet.contextmenu.css"/>
        <link rel="stylesheet" type="text/css" href="styles/leaflet/MarkerCluster.Default.css"/>
        <?php
        include_once('html_headers.php');
        ?>
        
        <!-- ADD ACTION CONSTANTS SPECIFIC FOR DOMAIN -->
        <script src="generateActionNames.php"></script>
        <!-- ADD IMAGE CONSTANTS SPECIFIC FOR DOMAIN -->
        <script src="generateImagesPaths.php"></script>
	<!-- ADD JS CONFIG VARIABLES -->
        <script src="js_config.php"></script>
        
	<!--[if lt IE 9]>
	    <script src="scripts/jquery/jquery-1.12.3.min.js"></script>
	    <script src="scripts/leaflet/0.7/leaflet.js"></script>
	    <script src="scripts/jquery/json2.js"></script>
	    <script type="text/javascript" src="scripts/leaflet/0.7/leaflet.markercluster.js"></script>
	<![endif]-->
	<!--[if (gt IE 8)]><!-->
	    <script src="scripts/jquery/jquery-3.2.0.min.js"><</script>
	    <script src="scripts/leaflet/leaflet.js"></script>
	    <script type="text/javascript" src="scripts/leaflet/leaflet.markercluster.js"></script>
	<!--<![endif]-->        
        <script src="scripts/jquery/jquery.cookie.js"></script>
        <script src="scripts/bootstrap/bootstrap.min.js"></script>               
        <script src="scripts/logger.min.js"></script>
        <script src="scripts/readmore.min.js"></script>
        <script src="scripts/bootstrap/bootstrap-slider.min.js"></script>
        <script src="scripts/leaflet/leaflet.contextmenu.js"></script>
        <script src="scripts/jquery.inputmask.bundle.min.js"></script>
        <script src="scripts/gets/models/Categories.Class.js"></script>
        <script src="scripts/gets/models/Points.Class.js"></script>
        <script src="scripts/gets/models/User.Class.js"></script>
        <script src="scripts/gets/models/Utils.Class.js"></script>
        <script src="scripts/gets/models/Map.Class.js"></script>
        <script src="scripts/gets/views/PointsMain.View.js"></script>
        <script src="scripts/gets/views/Map.View.js"></script>
        <script src="scripts/gets/views/PointInfo.View.js"></script>
        <script src="scripts/gets/views/PointAdd.View.js"></script>
        <script src="scripts/gets/views/PointEdit.View.js"></script>
        <script src="scripts/gets/views/Header.View.js"></script>
        <script src="scripts/gets/views/Message.View.js"></script>
        <script src="scripts/gets/controllers/PointsPage.Ctrl.js"></script>
        <script src="scripts/gets/controllers/Map.Ctrl.js"></script> 
        <script src="scripts/gets/controllers/Language.Ctrl.js"></script>
        <script>
            $(document).ready(function() {
                Logger.useDefaults();
                MessageBox = new MessageView($(document).find('.main-container'));
                var _pointsPageCtrl = new PointsPage(document, window);
                _pointsPageCtrl.initPage();               
            });    
        </script>
        <title>GeTS Web Client</title>
    </head>
    <body>
        <div class="main-container">
            <div class="main-header">
                <?php
                require_once('./widgets/Header.inc');
                echo get_navbar_depend_on_page(basename(__FILE__, '.php'));
                ?>
            </div>
            <div class="main-content">
                <div class="action-menu">
                    <?php
                    require_once('./widgets/PointsMain.inc');
                    require_once('./widgets/PointInfo.inc');
                    if (isset($_SESSION['g2t_token'])) {
                        require_once('./widgets/PointEdit.inc');
                    }
                    ?>
                </div>
                <div id="map"></div> 
            </div>
            <div class="main-footer">
                <?php
                require_once('./widgets/Footer.inc');
                ?>
            </div>
        </div>       
    </body>
</html>