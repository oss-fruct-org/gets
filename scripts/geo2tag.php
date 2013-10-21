<?php

include "add-user.inc";

/* create server */
$xmlrpc_server = xmlrpc_server_create();

/* register methods */
xmlrpc_server_register_method($xmlrpc_server, "addUser", "adduser_func");

/* process request */
$request_xml = $HTTP_RAW_POST_DATA;

$response = xmlrpc_server_call_method($xmlrpc_server, $request_xml, '');

print $response;

xmlrpc_server_destroy($xmlrpc_server);
?>