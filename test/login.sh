#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

curl -d@- "${GEO2TAG_SERVER}/service/login"  <<-EOF | ./json.sh auth_token > token.txt
{
    "login" : "test_user",
    "password" : "test_user_password"
}
EOF

