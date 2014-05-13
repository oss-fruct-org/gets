#!/usr/bin/env bash

#./reset-database.sh > /dev/null

if [ "$#" -ne 2 ]; then
    echo "Usage: ${0} channel name"
    exit 1
fi


source ./config.sh

echo "Executing deletePoint method"
curl -d@- "${GETS_SERVER}/deletePoint.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<channel>${1}</channel>
<name>${2}</name>

</params></request>
EOF
