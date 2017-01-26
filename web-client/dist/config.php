<?php
// Root directory of the project
define('ROOT_DIR', substr($_SERVER['SCRIPT_FILENAME'], 0, -strlen(basename(__FILE__))));

// Default language 
define('DEFAULT_LANG', 'en');

// Translations
define('TRANSLATIONS_DIR', ROOT_DIR . 'translations');
define('TRANSLATIONS_SCRIPT', TRANSLATIONS_DIR . '/translations.php');

if (file_exists(realpath(dirname(__FILE__)).'/config/server.config')) {
    include_once(realpath(dirname(__FILE__)).'/config/server.config');
} else {
    include_once(realpath(dirname(__FILE__)).'/actions/utils/default.server.config');
}
?>
