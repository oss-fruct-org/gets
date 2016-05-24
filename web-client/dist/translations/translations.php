<?php
define('LANGS_DIR', '/langs');

// First identify all available languages by scaning LANGS_DIR.
$available_langs = array();
$list_files = array_diff(scandir(TRANSLATIONS_DIR . LANGS_DIR), array('..', '.'));
foreach ($list_files as $file) {
    $available_langs[basename($file, '.php')] = TRANSLATIONS_DIR . LANGS_DIR . '/' . $file;
}

// Set default language that have to be always exist.
$lang = DEFAULT_LANG;

// Then handle different ways of identifing user's language.
handleLanguage();

// And finally include translation file according to a user's language (or default) 
require_once($available_langs[$lang]);


/************************************
 **  UTILS FUNCTIONS
 ************************************
 */

function getString($key, $default_value = 'Error') {
    global $translations;

    if ($translations) {
        if (array_key_exists($key, $translations)) {
            return $translations[$key];
        }
    } 
    
    return $default_value; 
}

function handleLanguage() {
    if (handleGETParam()) {
        return;
    }
    if (handleCookieValue()) {
        return;
    }
    
    handleAcceptLanguage();
}



/**
 * Check is GET param with key 'lang' set and if so, then 
 * set language according to this GET param value.
 */
function handleGETParam() {
    global $lang, $available_langs;

    if (isset($_GET['lang'])) {
        $lang_value = $_GET['lang'];
        if (strlen($lang_value) === 2) { 
            if (array_key_exists($lang_value, $available_langs)) {
                $lang = $lang_value;
                return TRUE;
            }           
        } 
    }
    
    return FALSE;
}

function handleCookieValue() {
    global $lang, $available_langs;
    
    if (isset($_COOKIE['lang'])) {
        $lang_value = $_COOKIE['lang'];
        if (strlen($lang_value) === 2) {
            if (array_key_exists($lang_value, $available_langs)) {
                $lang = $lang_value;
                $_SESSION['POST'] = $_POST;
                header('Location: ' . $_SERVER['PHP_SELF'] . '?lang=' . $lang);
                return TRUE;
            }
        }
    }
    
    return FALSE;
}

function handleAcceptLanguage() {
    global $lang, $available_langs;
    
    $accept_languages = getAcceptLanguageAsArray();   
    if ($accept_languages) {
        // look through sorted list and use first one that matches our languages
        foreach ($accept_languages as $acc_lang => $val) {           
            if (array_key_exists($acc_lang, $available_langs)) {
                $lang = $acc_lang;
                setcookie('lang', $lang, time() + (10 * 365 * 24 * 60 * 60));
                header('Location: ' . $_SERVER['PHP_SELF'] . '?lang=' . $lang);
                return TRUE;
            }
        }
    }
    
    return FALSE;
}

function getAcceptLanguageAsArray() {
    $langs = array();

    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        // break up string into pieces (languages and q factors)
        preg_match_all('/([a-z]{1,8}(-[a-z]{1,8})?)\s*(;\s*q\s*=\s*(1|0\.[0-9]+))?/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $lang_parse);

        if (count($lang_parse[1])) {
            // create a list like "en" => 0.8
            $langs = array_combine($lang_parse[1], $lang_parse[4]);

            // set default to 1 for any without q factor
            foreach ($langs as $alang => $val) {
                if ($val === '')
                    $langs[$alang] = 1;
            }

            // sort list based on value	
            arsort($langs, SORT_NUMERIC);
        }
    }
    
    return $langs;
}

?>

