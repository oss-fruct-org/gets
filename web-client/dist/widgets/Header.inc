<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
/**
 * Get HTML nav bar string to put on a page. 
 * Nav bar active tab will depend on given page name.
 * 
 * @param String $page_name Given page name string.
 */
function get_navbar_depend_on_page($page_name) {
    global $lang;
    
    $ret =  '
               <div class="navbar navbar-static-top navbar-default">
                    <div class="navbar-header">
                        <a class="navbar-brand navbar-option"></a>
                        <a class="navbar-brand" href="index.php">
                            <span class="glyphicon glyphicon-home"></span> GeTS Project
                        </a>
                        <a class="navbar-toggle"
                            data-toggle="collapse" data-target=".navbar-collapse">
                            <span class="glyphicon glyphicon-bar"></span>
                            <span class="glyphicon glyphicon-bar"></span>
                            <span class="glyphicon glyphicon-bar"></span>
                        </a>
                    </div>
                    <div class="container">
                        <div class="navbar-collapse collapse">
                            <ul class="nav navbar-nav">';
    if (defined('PAGE_POINTS') && constant('PAGE_POINTS') === true) {
        $ret .= '<li ' . ($page_name === 'points' ? 'class="active"' : '') . '><a href="points.php">' . getString('points', 'Points') . '</a></li>';
    }
    if (defined('PAGE_TRACKS') && constant('PAGE_TRACKS') === true) {
        $ret .= '<li ' . ($page_name === 'tracks' ? 'class="active"' : '') . '><a href="tracks.php">' . getString('tracks', 'Tracks') . '</a></li>';
    }
    if (defined('PAGE_ROUTES') && constant('PAGE_ROUTES') === true) {
        $ret .= '<li ' . ($page_name === 'routes' ? 'class="active"' : '') . '><a href="routes.php">' . getString('routes', 'Routes') . '</a></li>';
    }
    if (defined('PAGE_POLYGONS') && constant('PAGE_POLYGONS') === true) {
        $ret .= '<li ' . ($page_name === 'polygons' ? 'class="active"' : '') . '><a href="polygons.php">' . getString('polygons', 'Polygons') . '</a></li>';
    }
    $ret .= (isset($_SESSION['admin_user']) ? 
                                    '<li ' . (substr($page_name, 0, 5) === 'admin' ? 'class="active"' : '') . '><a href="admins.php">' . getString('admin', 'Admin') . '</a></li>'
                                    : "") . '                                
                            </ul>
                            <ul class="nav navbar-nav navbar-right">' . 
                                (
                                    !isset($_SESSION['g2t_token']) ? 
                                    '<li><a id="sign-in-btn" href="#">' . getString('sign-in', 'Sign In') . '</a></li>' : 
                                    '<li class="dropdown">
                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">' . 
                                            (isset($_SESSION['email']) ? $_SESSION['email'] : 'Unknown' ) . '<span class="caret"></span>
                                        </a>
                                        <ul class="dropdown-menu" role="menu">
                                            <li><a id="sign-out-btn" href="#">' . getString('sign-out', 'Sign Out') . '</a></li>
                                        </ul>
                                    </li>' 
                                )
                                . '<li class="dropdown">
                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">' . 
                                        ( 
                                            $lang && $lang === 'en' ?
                                                '<span class="lang-sm lang-lbl-full" lang="en"></span><span class="caret"></span>' 
                                            : ($lang && $lang === 'ru' ? 
                                                '<span class="lang-sm lang-lbl-full" lang="ru"></span><span class="caret"></span>'
                                            : 
                                                '<span class="lang-sm lang-lbl-full" lang="en"></span><span class="caret"></span>')        
                                        ) 
                                        . '</a>
                                        <ul class="dropdown-menu" role="menu">
                                            <li><a id="en-lang" class="lang-button" data-lang="en" href="#"><span class="lang-sm lang-lbl-full" lang="en"></span></a></li>
                                            <li><a id="ru-lang" class="lang-button" data-lang="ru" href="#"><span class="lang-sm lang-lbl-full" lang="ru"></span></a></li>
                                        </ul>
                                    </li>'    
                            . '</ul>
                        </div>
                        <!-- /.navbar-collapse -->
                    </div>
                    <!-- /.container -->
                </div>
                <!-- /.navbar -->';
    
    return $ret;
}

?>
<script>
navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

console.log(navigator.sayswho);
</script>