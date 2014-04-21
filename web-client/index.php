<?php

session_start();
if (isset($_SESSION['g2t_token'])) {
    header("Location:user.php");
} else {
    header("Location:login.php");
}
?>