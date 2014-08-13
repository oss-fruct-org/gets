<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

function getMenuAsString($file_name) {
    $menu_string = 
        '<table class="main-menu" border="0" cellpadding="0" cellspacing="0">' .
            
            '<tr><td class="' . ($file_name === 'points' ? 'menu-item-selected' : 
                'menu-item') . '"><a href="points.php"><span>Points</span></a></td>' .
            
            '<td class="' . ($file_name === 'tracks' ? 'menu-item-selected' : 
                'menu-item') . '"><a href="tracks.php"><span>Tracks</span></a></td>' . 
            
            '<td class="' . ($file_name === 'polygons' ? 'menu-item-selected' : 
                'menu-item') . '"><a href="polygons.php"><span>Polygons</span></a></td>' .
                                   
        '</table>';
        $menu_string .= 
            '<a class="sign-in-button" ' . 
                'href=" ' . (isset($_SESSION['g2t_token']) ? 'actions/logout.php' : 'login.php') . 
                '?return_url=' . $file_name . '.php">' . 
                (isset($_SESSION['g2t_token']) ? 'Sign out' : 'Sign in') . 
            '</a>';
    
    return $menu_string;
}
?>