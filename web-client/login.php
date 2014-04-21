<?php
    session_start();
    if (isset($_SESSION['g2t_token'])) {
	header("Location:user.php");
    }
?>
<html>
    <head>
        <?php
        include_once('html_headers.php');		
        ?>
        <script src="js/scripts.js"></script>
	<title>GeTS Web Client</title>	
    </head>
    <body>
	<?php
            if (isset($_GET['badlogin'])) {
                echo '<div style="width:350px; height:30px; 
                    top:35%; left:50%; margin-left:-150px; margin-top: -75px;
                    position: fixed; display: block;">
                    <p style="position: relative; display: block;
                    font-size: 18px; color: red; width: 400px; height: 20px;
                    top: 50%; left: 50%; margin-left: -175px; margin-top: -10px;">
                    Login or password is incorrect. Try again.</p></div>';
            } 
	?>
	<div class="login-element">
            <form action="actions/login_action.php" method="post">
                <p><input class="login-name" type="text" name="login_name" placeholder="Login"/></p>
                <p><input class="login-password" type="password" name="login_password" placeholder="Password"/></p>
                <p><input class="login-button" type="submit" name="submitlogin" value="Login"/></p>
            </form>
            <p align="center">or</p>
            <p><input class="login-button" type="button" value="Login with Google" onclick="authorizeGoogle();"/></p>
        </div>
    </body>
</html>
