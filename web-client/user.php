<?php
session_start();
if (!isset($_SESSION['g2t_token'])) {
    header("Location:login.php");
}
?>
<html>
    <head>
        <?php
        include 'html_headers.php';
        ?>
        <title>GeTS Web Client</title>
    </head>
    <body>
        <?php
        include 'widgets/header.php';
        ?>
        <table class="content-table" width="1100px" border="0" cellpadding="0" cellspacing="0">
            <tr style="width:100%;">
                <td style="width:300px;" valign="top">
                    <?php
                    include 'widgets/menu.php';
                    ?>
                </td>
                <td valign="top">
                </td>
            </tr>
        </table>
    </body>
</html>