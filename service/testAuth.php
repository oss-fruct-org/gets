<?php

require_once 'include/auth.inc';

auth_set_token(file_get_contents('php://input'));
echo auth_get_geo2tag_token();

?>
