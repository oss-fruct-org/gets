#!/usr/bin/env bash

#./reset-database.sh > /dev/null

if [ "$#" -ne 6 ]; then
    echo "Usage: ${0} channel title description link latitude longitude"
    exit 1
fi


source ./config.sh

echo "Executing addPoint method"
curl -d@- "${GETS_SERVER}/addPoint.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>

<channel>$1</channel>
<title>$2</title>
<description>$3</description>
<link>$4</link>
<latitude>$5</latitude>
<longitude>$6</longitude>
<altitude>0</altitude>
<time>$(date +"%d %m %Y %H:%M:%S.000")</time>

</params></request>
EOF
