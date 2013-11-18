<?php

include "add-user.inc";
include "category.inc";

function return_xmlrpc_error($errno,$errstr,$errfile=NULL,$errline=NULL
       ,$errcontext=NULL){
    global $xmlrpc_server;
    if(!$xmlrpc_server)die("Error: $errstr in '$errfile', line '$errline'");

    header("Content-type: text/xml; charset=UTF-8");
    print(xmlrpc_encode(array(
        'faultCode'=>$errno
        ,'faultString'=>"Remote XMLRPC Error from
          ".$_SERVER['HTTP_HOST'].": $errstr in at $errfile:$errline"
    )));
    die();
} 
set_error_handler('return_xmlrpc_error');

/* create server */
$xmlrpc_server = xmlrpc_server_create();

global $dbconn;
$dbconn = pg_connect("dbname=geo2tag user=geo2tag password=geo2tag");

/* register methods */
xmlrpc_server_register_method($xmlrpc_server, "addUser", "adduser_func");
xmlrpc_server_register_method($xmlrpc_server, "addCategory", "addcategory_func");
xmlrpc_server_register_method($xmlrpc_server, "getCategories", "getcategories_func");

/* process request */
$request_xml = $HTTP_RAW_POST_DATA;

$response = xmlrpc_server_call_method($xmlrpc_server, $request_xml, '');

header('Content-Type: text/xml');
echo $response;

xmlrpc_server_destroy($xmlrpc_server);
?>