#!/usr/bin/env bash

#./reset-database.sh > /dev/null

if [ "$#" -ne 4 ]; then
    echo "Usage: ${0} name desc url update"
    exit 1
fi


source ./config.sh

echo "Executing createTrack method"
curl -d@- "${GETS_SERVER}/createTrack.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<name>${1}</name>
<description>${2}</description>
<url>${3}</url>
<update>${4}</update>

</params></request>
EOF
