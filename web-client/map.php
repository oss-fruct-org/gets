<?php
session_start();
if (!isset($_SESSION['g2t_token'])) {
    header("Location:login.php");
}
include_once('actions/utils.inc');
?>
<html>
    <head>
        <?php
        include('html_headers.php');
        ?>
        <link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>
        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
        <script src="js/scripts.js"></script>
        <title>GeTS Web Client</title>        
    </head>
    <body>
        <?php
        include('widgets/header.php');
        ?>
        <table class="content-table" width="1100px" border="0" cellpadding="0" cellspacing="0">
            <tr style="width:100%;">
                <td style="width: 200px;" valign="top">
                    <?php
                    include('widgets/menu.php');
                    ?>
                </td>
                <td valign="top">
                    <div class="data-input">
                        <p>
                            <label for="latitude-input">Latitude: </label>
                            <input id="latitude-input" name="latitude" type="text" onchange="enableSubmit();">
                        </p>
                        <p>
                            <label for="longitude-input">Longitude: </label>
                            <input id="longitude-input" name="longitude" type="text" onchange="enableSubmit();">
                        </p>
                        <p>
                            <label for="radius-input">Radius: </label>
                            <input id="radius-input" name="radius" type="text" onchange="enableSubmit();">
                        </p>
                        <?php
                        $categories = getCategoriesAsArray($_SESSION['g2t_token']);
                        if (!is_null($categories)) {
                            echo '<p><label>Category: </label><select id="category-input" name="category" onchange="enableSubmit();">';
                            echo '<option value="-1" selected>Choose category: </option>';
                            foreach ($categories as $category) {
                                $option = '<option value="' . $category['id'] . '"';
                                $option .= '>' . $category['name'] . '</option>';
                                echo $option;
                            }
                            echo '</select>';
                            echo '<label>Space: </label><select name="space">' .
                            '<option value="all" selected>all</option>' .
                            '<option value="public">public</option>' .
                            '<option value="private">private</option></select>';
                        }
                        ?>
                        <p>
                            <input id="load-input" type="button" value="Load Points" disabled>
                        </p>
                    </div>
                    <div id="map" style="width: 600px; height: 600px"></div>
                </td>
            </tr>
        </table>    
        <script src="js/map.js"></script>
    </body>
</html>