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
?>
<html>
    <head>
        <?php
        include('html_headers.php');
        ?>
        <title>GeTS Web Client</title>
    </head>
    <body>
        <div class="main-container">
            <div class="main-header">
                <?php
                include('widgets/header.php');
                include('widgets/menu.php');
                echo getMenuAsString(basename(__FILE__, '.php'));
                ?>
            </div>
            <div class="main-content">
                <table class="content-table" width="1100px" border="0" cellpadding="0" cellspacing="0">
                    <tr style="width:200%;">
                        <td style="width:200px;" valign="top">
                        </td>
                        <td valign="top">
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
    </body>
</html>