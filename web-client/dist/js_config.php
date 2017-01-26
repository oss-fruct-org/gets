<?php

$content = "";

if (file_exists(realpath(dirname(__FILE__)).'/config/js.config')) {
    $content = file_get_contents(realpath(dirname(__FILE__)).'/config/js.config');
} else {
    $content = file_get_contents(realpath(dirname(__FILE__)).'/actions/utils/default.js.config');
}

echo $content;

?>