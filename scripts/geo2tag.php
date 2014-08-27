<?php

include "perm.inc";

include "user.inc";
include "category.inc";
include "tag.inc";
include "channel.inc";

function return_xmlrpc_error($errno,$errstr,$errfile=NULL,$errline=NULL
       ,$errcontext=NULL){
    global $xmlrpc_server;
    if(!$xmlrpc_server)die("Error: $errstr in '$errfile', line '$errline'");

    header("Content-type: text/xml; charset=UTF-8");
    print("<?xml version=\"1.0\" encoding=\"utf-8\"?>
<fault><value><struct><member><name>faultCode</name><value><int>$errno</int></value></member>
<member><name>faultString</name><value>
<string>Remote XMLRPC Error from ".$_SERVER['HTTP_HOST'].": $errstr at $errfile:$errline</string>
</value></member></struct></value></fault>\n");
    die();
} 
set_error_handler('return_xmlrpc_error');

/* create server */
$xmlrpc_server = xmlrpc_server_create();

global $dbconn;
$dbconn = pg_connect("host=geo2tag.cs.prv dbname=geo2tag user=geo2tag password=geo2tag");

/* register methods */
xmlrpc_server_register_method($xmlrpc_server, "addUser", "adduser_func");
xmlrpc_server_register_method($xmlrpc_server, "checkUser", "checkuser_func");
xmlrpc_server_register_method($xmlrpc_server, "addCategory", "addcategory_func");
xmlrpc_server_register_method($xmlrpc_server, "getCategories", "getcategories_func");
xmlrpc_server_register_method($xmlrpc_server, "deleteCategory", "deleteCategory_func");
xmlrpc_server_register_method($xmlrpc_server, "deleteDupTags", "deleteDupTags_func");
xmlrpc_server_register_method($xmlrpc_server, "deleteTag", "deleteTag_func");
xmlrpc_server_register_method($xmlrpc_server, "deleteChannel", "deleteChannel_func");
xmlrpc_server_register_method($xmlrpc_server, "deleteTag2", "deleteTag2_func");
xmlrpc_server_register_method($xmlrpc_server, "updateTag", "updateTag_func");
xmlrpc_server_register_method($xmlrpc_server, "getChannelDescription", "getChannelDescription_func");
xmlrpc_server_register_method($xmlrpc_server, "getCategoryChannel", "getCategoryChannel_func");


/* process request */
if (!isset($HTTP_RAW_POST_DATA)) $HTTP_RAW_POST_DATA = file_get_contents('php://input');
$request_xml = $HTTP_RAW_POST_DATA;

$response = xmlrpc_server_call_method($xmlrpc_server, $request_xml, '');

header('Content-Type: text/xml; charset=UTF-8');
echo $response;

xmlrpc_server_destroy($xmlrpc_server);
?>
