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
        <script src="js/scripts.js"></script>
        <title>GeTS Web Client</title>
    </head>
    <body onload="enableSubmit();">
        <?php
        include('widgets/header.php');
        ?>
        <table class="content-table" width="1100px" border="0" cellpadding="0" cellspacing="0">
            <tr style="width:100%;">
                <td style="width: 200px;" valign="top">
                    <?php
                    include('widgets/menu.php');
                    
                    $need_load_data = false;
                    if(isset($_GET['submit'])) {
                        $need_load_data = true;
                    }
                    ?>
                </td>
                <td valign="top">
                    <div class="data-input">
                        <form name="form-data" action="list.php" onsubmit="return checkGeoInput();" method="get">
                            <p>
                                <label for="latitude-input">Latitude: </label>
                                <input id="latitude-input" name="latitude" type="text" onchange="enableSubmit();" value="<?php if ($need_load_data) {echo $_GET['latitude'];} ?>">
                            </p>
                            <p>
                                <label for="longitude-input">Longitude: </label>
                                <input id="longitude-input" name="longitude" type="text" onchange="enableSubmit();" value="<?php if ($need_load_data) {echo $_GET['longitude'];} ?>">
                            </p>
                            <p>
                                <label for="radius-input">Radius: </label>
                                <input id="radius-input" name="radius" type="text" onchange="enableSubmit();" value="<?php if ($need_load_data) {echo $_GET['radius'];} ?>">
                            </p>
                            <?php
                            $categories = getCategoriesAsArray($_SESSION['g2t_token']);                    
                            if (!is_null($categories)) {                
                                echo '<p><label>Category: </label><select name="category" onchange="enableSubmit();">';
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
                                echo '<label>Space: </label><select name="space">' . 
                                    '<option value="all"' . (($need_load_data && $_GET['space'] === 'all')  ? 'selected' : '') . '>all</option>' . 
                                    '<option value="public"' . (($need_load_data && $_GET['space'] === 'public')  ? 'selected' : '') . '>public</option>' . 
                                    '<option value="private"' . (($need_load_data && $_GET['space'] === 'private')  ? 'selected' : '') . '>private</option></select>';
                            }
                            ?>
                            <p>
                                <input id="submit-input" name="submit" type="submit" value="Load Points" disabled>
                            </p>
                        </form>
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
            </tr>
        </table>
    </body>
</html>