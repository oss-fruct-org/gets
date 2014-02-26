#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

echo "Executing deleteTrack method"
curl -d@- "${GETS_SERVER}/deleteTrack.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<name>tr_private</name>

</params></request>
EOF
