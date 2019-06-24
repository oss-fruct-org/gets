<?php
session_start();
// Translations
#define('TRANSLATIONS_DIR', './translations');
#define('TRANSLATIONS_SCRIPT', TRANSLATIONS_DIR . '/translations.php');
#require_once(TRANSLATIONS_SCRIPT);
header('Content-Type: application/javascript');
require_once("config.php");
require_once(TRANSLATIONS_SCRIPT);

//load translations
$content = "function gettext(string){if (typeof LOCALE === 'undefined') {return string;} return LOCALE[string] ? LOCALE[string] : string;}\n";

$locale = "var LOCALE = {";

$first = true;

if ($translations) {
    foreach ($translations as $key => $value) {
	if ($first) {
	    $locale .= '"'.$key.'":"'.$value.'"';
	    $first = false; 
	} else {
	    $locale .= ',"'.$key.'":"'.$value.'"';
	}
    }
}

$locale .= "};\n";
$content .= $locale;
if (isset($_GET['lang'])) {
    $content .= "var lang='lang=".$_GET['lang']."';";
}else{
    $content .= "var lang=''";
}

// load config
if (file_exists(realpath(dirname(__FILE__)).'/config/js.config')) {
    $content .= file_get_contents(realpath(dirname(__FILE__)).'/config/js.config');
} else {
    $content .= file_get_contents(realpath(dirname(__FILE__)).'/actions/utils/default.js.config');
}

echo $content;

?>