<?php
require_once('config.php');

if (defined('MAIN_PAGE')) {
    header("Location: " . MAIN_PAGE);
} elseif (defined('PAGE_POINTS') && constant('PAGE_POINTS') === true) {
    header("Location: points.php");
} elseif (defined('PAGE_TRACKS') && constant('PAGE_TRACKS') === true) {
    header("Location: tracks.php");
} elseif (defined('PAGE_ROUTES') && constant('PAGE_ROUTES') === true) {
    header("Location: routes.php");
} elseif (defined('PAGE_POLYGONS') && constant('PAGE_POLYGONS') === true) {
    header("Location: polygons.php");
} else {
    header("Location: points.php");
}
?>
