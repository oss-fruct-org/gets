#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

curl -d@- "${GEO2TAG_SERVER}/service/login"  <<-EOF | ./json.sh auth_token > token.txt
{
    "login" : "delzex@gmail.com",
    "password" : "delzex@gmail.com"
}
EOF

