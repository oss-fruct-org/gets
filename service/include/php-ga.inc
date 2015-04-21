<?php

// =================== // ===================== // =================
// track request by google analytics

include_once('config.inc');
include_once('php-ga/autoload.php');
use UnitedPrototype\GoogleAnalytics;


if (defined('GA_ACCOUNT')) {
  
  // Initilize GA Tracker
  $tracker = new GoogleAnalytics\Tracker(GA_ACCOUNT, $_SERVER['HTTP_HOST']);
  // Assemble Visitor information
  $visitor = new GoogleAnalytics\Visitor();
  $visitor->setIpAddress($_SERVER['REMOTE_ADDR']);
  // if access from server then set IE6.0
  if (in_array('HTTP_USER_AGENT', $_SERVER)) {
    $visitor->setUserAgent($_SERVER['HTTP_USER_AGENT']);
  } else {
    $visitor->setUserAgent('MSIE 6.0');
  }
  //if (isset($_COOKIE['__utma'])) {
  //  $visitor->fromUtma($_COOKIE['__utma']);
  //}
  $visitor->setScreenResolution('800x600');

  // Assemble Session information
  $session = new GoogleAnalytics\Session();
  //$session->fromUtmb($_COOKIE['__utmb']);

  // Get filename from the previous request
  $filename = parse_url(urldecode($_SERVER['REQUEST_URI']), PHP_URL_PATH);

  // Assemble Page information
  $page = new GoogleAnalytics\Page($filename);
  $page->setTitle($filename);
  //error_log($tracker->getAccountId());
  if (in_array('HTTP_REFERER', $_SERVER)) {
    $page->setReferrer($_SERVER['HTTP_REFERER']);
  }

  // Track page view
  $tracker->trackPageview($page, $session, $visitor);
}

?>