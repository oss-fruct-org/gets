<?php

/**
 * Get HTML nav bar string to put on a page. 
 * Nav bar active tab will depend on given page name.
 * 
 * @param String $page_name Given page name string.
 */
function get_navbar_depend_on_page($page_name) {
    return '
               <div class="navbar navbar-static-top navbar-default">
                    <div class="navbar-header"><a class="navbar-brand" href="index.php">GeTS Project</a><a class="navbar-toggle"
                        data-toggle="collapse" data-target=".navbar-collapse">
                        <span class="glyphicon glyphicon-bar"></span>
                        <span class="glyphicon glyphicon-bar"></span>
                        <span class="glyphicon glyphicon-bar"></span>
                      </a>
                    </div>
                    <div class="container">
                        <div class="navbar-collapse collapse">
                            <ul class="nav navbar-nav">
                                <li ' . ($page_name === 'points' ? 'class="active"' : '') . '><a href="points.php">Points</a></li>
                                <li ' . ($page_name === 'tracks' ? 'class="active"' : '') . '><a href="tracks.php">Tracks</a></li>
                                <li ' . ($page_name === 'polygons' ? 'class="active"' : '') . '><a href="polygons.php">Polygons</a></li>
                            </ul>
                            <ul class="nav navbar-nav navbar-right">' . 
                                (
                                    !isset($_SESSION['g2t_token']) ? 
                                    '<li><a id="sign-in-btn" href="#">Sign in</a></li>' : 
                                    '<li class="dropdown">
                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">' . 
                                            (isset($_SESSION['email']) ? $_SESSION['email'] : 'Unknown' ) . '<span class="caret"></span>
                                        </a>
                                        <ul class="dropdown-menu" role="menu">
                                            <li><a id="sign-out-btn" href="#">Sign out</a></li>
                                        </ul>
                                    </li>' 
                                )                           
                            . '</ul>
                        </div>
                        <!-- /.navbar-collapse -->
                    </div>
                    <!-- /.container -->
                </div>
                <!-- /.navbar -->';
}

?>