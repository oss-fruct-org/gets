<?php

    function get_admin_menu_item($page_name) {

        return '
                    <ul class="nav nav-pills nav-stacked">
                        <li ' . ($page_name === 'adminh' ? 'class="active"' : '') . '><a href="admins.php">' . getString('admin-home', 'Home!') . '</a></li>
                        <li ' . ($page_name === 'adminc' ? 'class="active"' : '') . '><a href="adminc.php">' . getString('admin-categories', 'Categories') . '</a></li>
                        <li ' . ($page_name === 'admins' ? 'class="active"' : '') . '><a href="admins.php">' . getString('admin-users', 'Users') . '</a></li>
                        <li ' . ($page_name === 'admint' ? 'class="active"' : '') . '><a href="admint.php">' . getString('admin-cont', 'Content') . '</a></li>
                    </ul>       
                ';
    }
?>