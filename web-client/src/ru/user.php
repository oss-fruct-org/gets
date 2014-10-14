<?php
session_start();
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
                include('widgets/main/header.inc');
                include('widgets/main/menu.inc');
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
                include('widgets/main/footer.inc');
                ?>
            </div>
        </div>
    </body>
</html>