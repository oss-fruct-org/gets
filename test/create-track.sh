#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

echo "Executing createTrack method"
curl -d@- "${GETS_SERVER}/createTrack.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<name>newtrack</name>
<description>Desc channel</description>
<url>http://example.com</url>
<lang>ru_RU</lang>

</params></request>
EOF
