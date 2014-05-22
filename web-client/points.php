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
                
                $need_load_data = false;
                if (isset($_GET['submit'])) {
                    $need_load_data = true;
                }
                ?>
            </div>
            <div class="main-content">
                <table class="content-table" width="1100px" border="0" cellpadding="0" cellspacing="0">
                    <tr style="width:400px;">
                        <td style="width: 400px;" valign="top">
                            <div id="accordion">
                                <h3>Load points</h3>                           
                                <div class="data-input">
                                        <p>
                                            <input id="latitude-input" name="latitude" 
                                                   type="text" onchange="enableSubmit();" 
                                                   value="<?php if ($need_load_data) {echo $_GET['latitude'];} ?>" 
                                                   placeholder="Latitude">
                                        </p>
                                        <p>
                                            <input id="longitude-input" name="longitude" 
                                                   type="text" onchange="enableSubmit();" 
                                                   value="<?php if ($need_load_data) {echo $_GET['longitude'];} ?>" 
                                                   placeholder="Longitude">
                                        </p>
                                        <p>
                                            <input id="radius-input" name="radius" 
                                                   type="text" onchange="enableSubmit();" 
                                                   value="<?php if ($need_load_data) {echo $_GET['radius'];} ?>" 
                                                   placeholder="Radius">
                                        </p>
                                        <?php
                                        $categories = getCategoriesAsArray($_SESSION['g2t_token']);                    
                                        if (!is_null($categories)) {                
                                            echo '<p><select id="category-input" name="category" onchange="enableSubmit();">';
                                            $optionOne = '<option value="-1" ';
                                            if ($need_load_data) {
                                                if ($_GET['category'] == -1) {
                                                    $optionOne .= 'selected';
                                                }
                                            }
                                            $optionOne .= '>Choose category: </option>';
                                            echo $optionOne;
                                            foreach ($categories as $category) {
                                                $option = '<option value="' . $category['id'] . '" ';
                                                if ($need_load_data) {
                                                    if ($_GET['category'] == $category['id']) {
                                                        $option .= 'selected';
                                                    }
                                                }
                                                $option .= '>' . $category['name'] . '</option>';
                                                echo $option;
                                            }
                                            echo '</select>';
                                            if (!isset($_SESSION['guestsession'])) {
                                                echo '<label>Space: </label><select id="space-input" name="space">' . 
                                                    '<option value="all"' . (($need_load_data && $_GET['space'] === 'all')  ? 'selected' : '') . '>all</option>' . 
                                                    '<option value="public"' . (($need_load_data && $_GET['space'] === 'public')  ? 'selected' : '') . '>public</option>' . 
                                                    '<option value="private"' . (($need_load_data && $_GET['space'] === 'private')  ? 'selected' : '') . '>private</option></select>';
                                            } else {
                                                echo '<input id="space-input" name="space" type="hidden" value="public"/>';
                                            }
                                        }
                                        ?>
                                        <p>
                                            <input id="load-input" type="button" value="Load Points" disabled>
                                        </p>
                                </div>  
                            </div>
                            <?php
                            if ($need_load_data) {
                                $location_condition = !empty($_GET['latitude']) && !empty($_GET['longitude']) && !empty($_GET['radius']);
                                $category_condition = $_GET['category'] != -1;

                                $response = array();
                                if ($location_condition && $category_condition) {
                                    $response = getPointsAsArray($_SESSION['g2t_token'], $_GET['space'], $_GET['latitude'], $_GET['longitude'], $_GET['radius'], $_GET['category']);
                                } elseif ($location_condition) {
                                    $response = getPointsAsArray($_SESSION['g2t_token'], $_GET['space'], $_GET['latitude'], $_GET['longitude'], $_GET['radius'], -1);
                                } else {
                                    $response = getPointsAsArray($_SESSION['g2t_token'], $_GET['space'], NULL, NULL, NULL, $_GET['category']);
                                }

                                echo '<table bgcolor="#ffffff" border="1">';
                                echo '<thead><tr><td><b>Name</b></td><td><b>Description</b></td><td><b>Coordinates</b></td><td><b>Map</b></td></tr></thead>';
                                echo '<tbody>';
                                foreach ($response as $point) {
                                    echo '<tr>';

                                    echo '<td>' . $point['name'] . '</td>';
                                    echo '<td>' . $point['description'] . '</td>';
                                    $coords = explode(',', $point['coords']);
                                    echo '<td>' . $coords[1] . ',' . $coords[0] . '</td>';
                                    echo '<td style="width: 130px;"><a target="_blank" href="https://maps.google.com/maps?t=h&q=loc:' . $coords[1] . ',' . $coords[0] . '&z=10">Show on a map</a></td>';

                                    echo '</tr>';
                                }
                                echo '</tbody>';
                                echo '</table>';
                            }
                            ?>
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