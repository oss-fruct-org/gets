<?php
session_start();
$result = array();
if (isset($_SESSION['email'])) {
    $result['email'] = $_SESSION['email'];
    echo json_encode($result);
} else {
    $result['email'] = 'unknown';
    echo json_encode($result);
}
?>