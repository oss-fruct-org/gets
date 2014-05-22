<?php
function getMenuAsString($file_name) {
    $menu_string = 
        '<table class="main-menu" border="0" cellpadding="0" cellspacing="0">' .
            
            '<tr><td class="' . ($file_name === 'points' ? 'menu-item-selected' : 
                'menu-item') . '"><a href="points.php"><span>Points</span></a></td>' .
            
            '<td class="' . ($file_name === 'tracks' ? 'menu-item-selected' : 
                'menu-item') . '"><a href="tracks.php"><span>Tracks</span></a></td>' . 
            
            '<td class="' . ($file_name === 'polygons' ? 'menu-item-selected' : 
                'menu-item') . '"><a href="polygons.php"><span>Polygons</span></a></td>' .
                        
            '<td class="menu-item"><a href="actions/logout_action.php"><span>' . 
                'Logout</span></a></td></tr>' . 
            
        '</table>'
    ;
    
    return $menu_string;
}
?>