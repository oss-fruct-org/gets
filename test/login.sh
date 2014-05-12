#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

if [ "$#" -eq 2 ]; then
    LOGIN=$1
    PASSWORD=$2
fi

curl -d@- "${GEO2TAG_SERVER}/service/login"  <<-EOF | ./json.sh auth_token > token.txt
{
    "login" : "${LOGIN}",
    "password" : "${PASSWORD}"
}
EOF


