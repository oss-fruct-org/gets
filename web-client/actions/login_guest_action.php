<?php

if (!empty($_POST['guestsession'])) {
    session_start();
    $_SESSION['guestsession'] = 1;
    header("Location:../user.php");
}

?>